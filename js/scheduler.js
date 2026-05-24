(function () {
    const CONFIG_URL = '../../data/scheduler-config.json';
    const state = {
        config: null,
        eventTypes: [],
        selectedEventType: null,
        selectedDateKey: '',
        selectedSlot: null,
        slotsByDate: new Map(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
        liveApiAvailable: false,
        hold: null,
        step: 'type',
        previewMode: false
    };

    const elements = {};

    document.addEventListener('DOMContentLoaded', async () => {
        cacheElements();
        bindEvents();
        await initializeScheduler();
    });

    function cacheElements() {
        elements.steps = Array.from(document.querySelectorAll('[data-scheduler-step]'));
        elements.eventTypeGrid = document.getElementById('eventTypeGrid');
        elements.dateStrip = document.getElementById('dateStrip');
        elements.timeSlotGrid = document.getElementById('timeSlotGrid');
        elements.timeZoneLabel = document.getElementById('timeZoneLabel');
        elements.previewNotice = document.getElementById('previewNotice');
        elements.status = document.getElementById('schedulerStatus');
        elements.summaryType = document.getElementById('summaryType');
        elements.summaryTime = document.getElementById('summaryTime');
        elements.summaryFormat = document.getElementById('summaryFormat');
        elements.summaryNotice = document.getElementById('summaryNotice');
        elements.detailsForm = document.getElementById('schedulerDetailsForm');
        elements.confirmationPanel = document.getElementById('confirmationPanel');
        elements.reviewDetails = document.getElementById('reviewDetails');
        elements.nextFromType = document.getElementById('nextFromType');
        elements.backToType = document.getElementById('backToType');
        elements.nextFromTime = document.getElementById('nextFromTime');
        elements.backToTime = document.getElementById('backToTime');
        elements.backToDetails = document.getElementById('backToDetails');
        elements.startOver = document.getElementById('startOver');
        elements.views = {
            type: document.getElementById('viewType'),
            time: document.getElementById('viewTime'),
            details: document.getElementById('viewDetails'),
            confirm: document.getElementById('viewConfirm')
        };
    }

    function bindEvents() {
        elements.nextFromType.addEventListener('click', () => {
            if (!state.selectedEventType) {
                showStatus('Choose a lesson type first.', true);
                return;
            }
            setStep('time');
        });

        elements.backToType.addEventListener('click', () => setStep('type'));
        elements.nextFromTime.addEventListener('click', () => {
            if (!state.selectedSlot) {
                showStatus('Choose a time first.', true);
                return;
            }
            setStep('details');
        });
        elements.backToTime.addEventListener('click', () => setStep('time'));
        elements.backToDetails.addEventListener('click', () => setStep('details'));
        elements.startOver.addEventListener('click', resetScheduler);
        elements.detailsForm.addEventListener('submit', handleSubmit);
        document.addEventListener('click', (event) => {
            if (event.target.closest('[data-scheduler-mailto]')) {
                trackSchedulerEvent('scheduler_mailto_click');
            }
        });
    }

    async function initializeScheduler() {
        try {
            const configResponse = await fetch(CONFIG_URL, { cache: 'no-store' });
            state.config = await configResponse.json();
            state.eventTypes = state.config.eventTypes || [];
            elements.timeZoneLabel.textContent = state.timeZone;

            await tryLoadLiveEventTypes();
            renderEventTypes();
            renderSummary();
            setStep('type');
        } catch (error) {
            showStatus('The scheduler could not load. Please email info@pawnislandacademy.com to book a lesson.', true);
        }
    }

    async function tryLoadLiveEventTypes() {
        if (!state.config.apiBaseUrl) {
            state.previewMode = true;
            return;
        }

        try {
            const response = await fetch(`${state.config.apiBaseUrl}/event-types`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Event types unavailable');
            const data = await response.json();
            if (Array.isArray(data.eventTypes) && data.eventTypes.length) {
                state.eventTypes = data.eventTypes;
                state.liveApiAvailable = true;
            }
        } catch (error) {
            state.previewMode = Boolean(state.config.previewAvailability?.enabled);
        }
    }

    function renderEventTypes() {
        elements.eventTypeGrid.textContent = '';
        state.eventTypes.forEach((eventType) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'event-type-card';
            button.dataset.eventType = eventType.id;
            button.setAttribute('aria-pressed', 'false');
            button.innerHTML = `
                <span class="event-type-icon"><i class="fas ${escapeHtml(eventType.icon || 'fa-chess-knight')}" aria-hidden="true"></i></span>
                <h3>${escapeHtml(eventType.name)}</h3>
                <span class="event-type-meta">
                    <span>${escapeHtml(String(eventType.durationMinutes))} min</span>
                    <span>${escapeHtml(eventType.format || 'Coaching')}</span>
                </span>
                <p>${escapeHtml(eventType.description || '')}</p>
                <small>${escapeHtml(eventType.bestFor || '')}</small>
            `;
            button.addEventListener('click', () => selectEventType(eventType.id));
            elements.eventTypeGrid.appendChild(button);
        });
    }

    async function selectEventType(eventTypeId) {
        state.selectedEventType = state.eventTypes.find((eventType) => eventType.id === eventTypeId);
        state.selectedSlot = null;
        state.selectedDateKey = '';
        state.hold = null;

        document.querySelectorAll('.event-type-card').forEach((card) => {
            const selected = card.dataset.eventType === eventTypeId;
            card.classList.toggle('is-selected', selected);
            card.setAttribute('aria-pressed', String(selected));
        });

        elements.nextFromType.disabled = false;
        renderSummary();
        trackSchedulerEvent('scheduler_lesson_type_selected', {
            event_type: state.selectedEventType.id,
            event_name: state.selectedEventType.name
        });
        await loadAvailability();
    }

    async function loadAvailability() {
        if (!state.selectedEventType) return;

        showStatus('Checking lesson availability...');
        elements.dateStrip.textContent = '';
        elements.timeSlotGrid.textContent = '';

        try {
            const slots = state.liveApiAvailable
                ? await fetchLiveAvailability()
                : generatePreviewAvailability();

            state.slotsByDate = groupSlotsByDate(slots);
            state.selectedDateKey = Array.from(state.slotsByDate.keys())[0] || '';
            renderDates();
            renderTimeSlots();

            if (state.previewMode && state.config.previewAvailability?.message) {
                elements.previewNotice.hidden = false;
                elements.previewNotice.textContent = state.config.previewAvailability.message;
            } else {
                elements.previewNotice.hidden = true;
            }

            showStatus('');
        } catch (error) {
            state.previewMode = true;
            const slots = generatePreviewAvailability();
            state.slotsByDate = groupSlotsByDate(slots);
            state.selectedDateKey = Array.from(state.slotsByDate.keys())[0] || '';
            renderDates();
            renderTimeSlots();
            elements.previewNotice.hidden = false;
            elements.previewNotice.textContent = 'Live calendar availability is temporarily unavailable. These preview times show the booking flow.';
            showStatus('');
        }
    }

    async function fetchLiveAvailability() {
        const today = new Date();
        const from = today.toISOString().slice(0, 10);
        const url = new URL(`${state.config.apiBaseUrl}/availability`);
        url.searchParams.set('eventType', state.selectedEventType.id);
        url.searchParams.set('from', from);
        url.searchParams.set('days', '21');
        url.searchParams.set('timeZone', state.timeZone);

        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Availability unavailable');
        const data = await response.json();
        return data.slots || [];
    }

    function generatePreviewAvailability() {
        const windows = state.config.previewAvailability?.weeklyWindows || [];
        const duration = state.selectedEventType.durationMinutes || 60;
        const slots = [];
        const today = new Date();

        for (let offset = 1; offset <= 21; offset += 1) {
            const date = new Date(today);
            date.setDate(today.getDate() + offset);
            const matchingWindow = windows.find((window) => window.days.includes(date.getDay()));
            if (!matchingWindow) continue;

            matchingWindow.times.forEach((time) => {
                const [hours, minutes] = time.split(':').map(Number);
                const start = new Date(date);
                start.setHours(hours, minutes, 0, 0);
                const end = new Date(start.getTime() + duration * 60000);
                slots.push({
                    start: start.toISOString(),
                    end: end.toISOString(),
                    timeZone: state.config.hostTimeZone,
                    preview: true
                });
            });
        }

        return slots;
    }

    function groupSlotsByDate(slots) {
        return slots.reduce((groups, slot) => {
            const key = formatDateKey(slot.start);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(slot);
            return groups;
        }, new Map());
    }

    function renderDates() {
        elements.dateStrip.textContent = '';
        if (!state.slotsByDate.size) {
            elements.dateStrip.innerHTML = '<p>No open times are currently available. Please email info@pawnislandacademy.com.</p>';
            return;
        }

        Array.from(state.slotsByDate.keys()).slice(0, 7).forEach((dateKey) => {
            const firstSlot = state.slotsByDate.get(dateKey)[0];
            const date = new Date(firstSlot.start);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'date-button';
            button.classList.toggle('is-selected', dateKey === state.selectedDateKey);
            button.innerHTML = `
                <span>${formatDate(date, { weekday: 'short' })}</span>
                <strong>${formatDate(date, { day: 'numeric' })}</strong>
                <span>${formatDate(date, { month: 'short' })}</span>
            `;
            button.addEventListener('click', () => {
                state.selectedDateKey = dateKey;
                state.selectedSlot = null;
                renderDates();
                renderTimeSlots();
                renderSummary();
            });
            elements.dateStrip.appendChild(button);
        });
    }

    function renderTimeSlots() {
        elements.timeSlotGrid.textContent = '';
        const slots = state.slotsByDate.get(state.selectedDateKey) || [];

        slots.forEach((slot) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'time-slot-button';
            button.classList.toggle('is-selected', state.selectedSlot?.start === slot.start);
            button.textContent = formatTime(slot.start);
            button.addEventListener('click', () => selectSlot(slot));
            elements.timeSlotGrid.appendChild(button);
        });
    }

    async function selectSlot(slot) {
        state.selectedSlot = slot;
        state.hold = null;
        renderTimeSlots();
        renderSummary();
        elements.nextFromTime.disabled = false;
        trackSchedulerEvent('scheduler_time_selected', {
            event_type: state.selectedEventType.id,
            start_time: slot.start,
            preview_mode: Boolean(slot.preview || state.previewMode)
        });

        if (state.liveApiAvailable) {
            await createHold(slot);
        }
    }

    async function createHold(slot) {
        showStatus('Holding this time while you finish the form...');
        try {
            const response = await fetch(`${state.config.apiBaseUrl}/holds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    eventType: state.selectedEventType.id,
                    start: slot.start,
                    end: slot.end,
                    timeZone: state.timeZone
                })
            });
            if (!response.ok) throw new Error('Hold unavailable');
            state.hold = await response.json();
            showStatus('This time is held for 10 minutes.');
        } catch (error) {
            showStatus('I could not hold that time yet. I will re-check it when you submit.', false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!state.selectedEventType || !state.selectedSlot) {
            showStatus('Choose a lesson type and time before confirming.', true);
            return;
        }

        const formData = new FormData(elements.detailsForm);
        const payload = {
            eventType: state.selectedEventType.id,
            start: state.selectedSlot.start,
            end: state.selectedSlot.end,
            timeZone: state.timeZone,
            holdId: state.hold?.holdId || '',
            client: {
                name: String(formData.get('name') || '').trim(),
                email: String(formData.get('email') || '').trim(),
                phone: String(formData.get('phone') || '').trim(),
                playerName: String(formData.get('playerName') || '').trim(),
                rating: String(formData.get('rating') || '').trim(),
                goals: String(formData.get('goals') || '').trim(),
                formatPreference: String(formData.get('formatPreference') || '').trim()
            }
        };

        if (!payload.client.name || !payload.client.email || !payload.client.goals) {
            showStatus('Name, email, and goals are required.', true);
            return;
        }

        if (!state.liveApiAvailable || state.previewMode || state.selectedSlot.preview) {
            renderFallbackRequest(payload);
            setStep('confirm');
            trackSchedulerEvent('scheduler_request_prepared', {
                event_type: state.selectedEventType.id,
                preview_mode: true
            });
            return;
        }

        showStatus('Confirming your lesson on the calendar...');
        try {
            const response = await fetch(`${state.config.apiBaseUrl}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Booking failed');
            }
            renderConfirmation(data);
            setStep('confirm');
            showStatus('');
            trackSchedulerEvent('scheduler_booking_confirmed', {
                event_type: state.selectedEventType.id,
                booking_id: data.bookingId || ''
            });
        } catch (error) {
            showStatus(error.message || 'That time is no longer available. Please choose another time.', true);
            trackSchedulerEvent('scheduler_booking_error', {
                event_type: state.selectedEventType.id,
                error_message: error.message || 'Booking failed'
            });
            await loadAvailability();
            setStep('time');
        }
    }

    function renderFallbackRequest(payload) {
        const subject = encodeURIComponent(`Lesson request: ${state.selectedEventType.name}`);
        const body = encodeURIComponent([
            `Lesson type: ${state.selectedEventType.name}`,
            `Requested time: ${formatFullDateTime(payload.start)}`,
            `Name: ${payload.client.name}`,
            `Email: ${payload.client.email}`,
            `Phone: ${payload.client.phone || 'Not provided'}`,
            `Player: ${payload.client.playerName || 'Not provided'}`,
            `Rating/level: ${payload.client.rating || 'Not provided'}`,
            '',
            'Goals:',
            payload.client.goals
        ].join('\n'));
        const email = state.config.fallbackEmail || 'info@pawnislandacademy.com';

        elements.confirmationPanel.innerHTML = `
            <h3>Request prepared</h3>
            <p>The live calendar backend is not connected in this environment yet. Send this request and we will confirm the time manually.</p>
            <a class="scheduler-button" data-scheduler-mailto href="mailto:${email}?subject=${subject}&body=${body}">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                Send Request
            </a>
        `;
    }

    function renderConfirmation(data) {
        elements.confirmationPanel.innerHTML = `
            <h3>Your lesson request is confirmed</h3>
            <p>You will receive a calendar invitation and confirmation email shortly.</p>
            <dl class="summary-list">
                <div><dt>Lesson</dt><dd>${escapeHtml(state.selectedEventType.name)}</dd></div>
                <div><dt>Time</dt><dd>${escapeHtml(formatFullDateTime(state.selectedSlot.start))}</dd></div>
                <div><dt>Confirmation</dt><dd>${escapeHtml(data.bookingId || 'Confirmed')}</dd></div>
            </dl>
        `;
    }

    function setStep(step) {
        state.step = step;
        trackSchedulerEvent('scheduler_step_view', {
            step,
            event_type: state.selectedEventType?.id || ''
        });
        Object.entries(elements.views).forEach(([viewName, element]) => {
            element.hidden = viewName !== step;
        });

        const order = ['type', 'time', 'details', 'confirm'];
        const activeIndex = order.indexOf(step);
        elements.steps.forEach((stepElement) => {
            const index = order.indexOf(stepElement.dataset.schedulerStep);
            stepElement.classList.toggle('is-active', index === activeIndex);
            stepElement.classList.toggle('is-complete', index < activeIndex);
        });

        renderSummary();
        document.getElementById('schedulerPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderSummary() {
        elements.summaryType.textContent = state.selectedEventType?.name || 'Choose a lesson type';
        elements.summaryFormat.textContent = state.selectedEventType
            ? `${state.selectedEventType.durationMinutes} minutes · ${state.selectedEventType.format || 'Coaching'}`
            : 'Format and duration will appear here.';
        elements.summaryTime.textContent = state.selectedSlot
            ? formatFullDateTime(state.selectedSlot.start)
            : 'Choose an available time.';
        elements.summaryNotice.textContent = state.previewMode
            ? 'Preview mode until the calendar backend is deployed.'
            : 'Availability is checked against the live calendar before confirmation.';

        if (elements.reviewDetails) {
            elements.reviewDetails.innerHTML = `
                <div><dt>Lesson</dt><dd>${escapeHtml(elements.summaryType.textContent)}</dd></div>
                <div><dt>Time</dt><dd>${escapeHtml(elements.summaryTime.textContent)}</dd></div>
                <div><dt>Time zone</dt><dd>${escapeHtml(state.timeZone)}</dd></div>
            `;
        }
    }

    function resetScheduler() {
        state.selectedSlot = null;
        state.hold = null;
        elements.detailsForm.reset();
        setStep('type');
    }

    function showStatus(message, isError) {
        elements.status.hidden = !message;
        elements.status.textContent = message;
        elements.status.classList.toggle('is-error', Boolean(isError));
    }

    function trackSchedulerEvent(eventName, parameters = {}) {
        if (typeof window.gtag !== 'function') return;

        window.gtag('event', eventName, {
            event_category: 'scheduler',
            ...parameters
        });
    }

    function formatDateKey(value) {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: state.timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(value));
    }

    function formatDate(date, options) {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: state.timeZone,
            ...options
        }).format(date);
    }

    function formatTime(value) {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: state.timeZone,
            hour: 'numeric',
            minute: '2-digit'
        }).format(new Date(value));
    }

    function formatFullDateTime(value) {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: state.timeZone,
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        }).format(new Date(value));
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
