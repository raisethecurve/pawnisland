const HOST_TIME_ZONE = 'America/New_York';
const HOLD_MINUTES = 10;
const DEFAULT_ORIGIN = 'https://www.pawnislandacademy.com';

const EVENT_TYPES = [
    {
        id: 'private-online-60',
        name: 'Private Online Lesson',
        durationMinutes: 60,
        format: 'Online',
        description: 'A focused one-on-one lesson with game review, calculation work, and a clear training assignment.',
        bestFor: 'Students outside Rhode Island or anyone who wants the most flexible format.',
        icon: 'fa-laptop',
        location: 'Online - details to follow'
    },
    {
        id: 'private-in-person-60',
        name: 'Private In-Person Lesson',
        durationMinutes: 60,
        format: 'Rhode Island',
        description: 'Board-first coaching for students and families who want in-person feedback and practical training.',
        bestFor: 'Local students, scholastic players, and families preparing for tournaments.',
        icon: 'fa-chess-board',
        location: 'Rhode Island - location confirmed after booking'
    },
    {
        id: 'student-fit-call-20',
        name: 'Student Fit Call',
        durationMinutes: 20,
        format: 'Phone or video',
        description: 'A short conversation about goals, rating, schedule, and whether coaching is the right fit.',
        bestFor: 'New families or adults who want to talk before booking a lesson.',
        icon: 'fa-comments',
        location: 'Phone or video'
    }
];

const AVAILABILITY_RULES = {
    minimumNoticeHours: 18,
    bookingHorizonDays: 60,
    slotIntervalMinutes: 30,
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 15,
    maxSlotsPerResponse: 60,
    weeklyWindows: [
        { day: 2, start: '16:30', end: '20:30', eventTypes: ['private-online-60', 'private-in-person-60', 'student-fit-call-20'] },
        { day: 4, start: '16:30', end: '20:30', eventTypes: ['private-online-60', 'private-in-person-60', 'student-fit-call-20'] },
        { day: 6, start: '09:30', end: '14:30', eventTypes: ['private-online-60', 'private-in-person-60'] }
    ],
    blackoutDates: []
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(request, env) });
        }

        try {
            const url = new URL(request.url);
            const pathname = url.pathname.replace(/^\/scheduler/, '');

            if (request.method === 'GET' && pathname === '/event-types') {
                return json({ eventTypes: publicEventTypes(), rules: publicRules() }, request, env);
            }

            if (request.method === 'GET' && pathname === '/availability') {
                const slots = await getAvailability(request, env);
                return json({ slots, generatedAt: new Date().toISOString() }, request, env);
            }

            if (request.method === 'POST' && pathname === '/holds') {
                const hold = await createHold(request, env);
                return json(hold, request, env, 201);
            }

            if (request.method === 'POST' && pathname === '/bookings') {
                const booking = await createBooking(request, env);
                return json(booking, request, env, 201);
            }

            return json({ error: 'Not found' }, request, env, 404);
        } catch (error) {
            const status = error.status || 500;
            return json({ error: error.publicMessage || 'Scheduler request failed' }, request, env, status);
        }
    }
};

function publicEventTypes() {
    return EVENT_TYPES.map(({ location, ...eventType }) => eventType);
}

function publicRules() {
    return {
        minimumNoticeHours: AVAILABILITY_RULES.minimumNoticeHours,
        bookingHorizonDays: AVAILABILITY_RULES.bookingHorizonDays,
        hostTimeZone: HOST_TIME_ZONE
    };
}

async function getAvailability(request, env) {
    const url = new URL(request.url);
    const eventType = getEventType(url.searchParams.get('eventType'));
    const from = parseDateKey(url.searchParams.get('from')) || localDateKey(new Date(), HOST_TIME_ZONE);
    const requestedDays = Number(url.searchParams.get('days') || 21);
    const days = Math.max(1, Math.min(requestedDays, AVAILABILITY_RULES.bookingHorizonDays));

    const windowStart = zonedDateTimeToUtc(from, '00:00', HOST_TIME_ZONE);
    const windowEndDate = addDaysToDateKey(from, days);
    const windowEnd = zonedDateTimeToUtc(windowEndDate, '23:59', HOST_TIME_ZONE);
    const busyIntervals = await getBusyIntervals(windowStart, windowEnd, env);
    const heldIntervals = await getHeldIntervals(env, windowStart, windowEnd);
    const slots = [];
    const now = new Date();
    const earliest = new Date(now.getTime() + AVAILABILITY_RULES.minimumNoticeHours * 60 * 60 * 1000);
    const latest = new Date(now.getTime() + AVAILABILITY_RULES.bookingHorizonDays * 24 * 60 * 60 * 1000);

    for (let offset = 0; offset < days; offset += 1) {
        const dateKey = addDaysToDateKey(from, offset);
        if (AVAILABILITY_RULES.blackoutDates.includes(dateKey)) continue;

        const dayOfWeek = dayOfWeekForDateKey(dateKey);
        const windows = AVAILABILITY_RULES.weeklyWindows.filter((window) => {
            return window.day === dayOfWeek && window.eventTypes.includes(eventType.id);
        });

        for (const window of windows) {
            let cursor = zonedDateTimeToUtc(dateKey, window.start, HOST_TIME_ZONE);
            const windowEndTime = zonedDateTimeToUtc(dateKey, window.end, HOST_TIME_ZONE);

            while (cursor.getTime() + eventType.durationMinutes * 60000 <= windowEndTime.getTime()) {
                const start = new Date(cursor);
                const end = new Date(start.getTime() + eventType.durationMinutes * 60000);
                const protectedStart = new Date(start.getTime() - AVAILABILITY_RULES.bufferBeforeMinutes * 60000);
                const protectedEnd = new Date(end.getTime() + AVAILABILITY_RULES.bufferAfterMinutes * 60000);

                if (
                    start >= earliest &&
                    start <= latest &&
                    !overlapsAny(protectedStart, protectedEnd, busyIntervals) &&
                    !overlapsAny(protectedStart, protectedEnd, heldIntervals)
                ) {
                    slots.push({
                        start: start.toISOString(),
                        end: end.toISOString(),
                        timeZone: HOST_TIME_ZONE,
                        eventType: eventType.id
                    });
                }

                cursor = new Date(cursor.getTime() + AVAILABILITY_RULES.slotIntervalMinutes * 60000);
                if (slots.length >= AVAILABILITY_RULES.maxSlotsPerResponse) return slots;
            }
        }
    }

    return slots;
}

async function createHold(request, env) {
    const body = await readJson(request);
    const eventType = getEventType(body.eventType);
    const start = parseInstant(body.start);
    const end = parseInstant(body.end);
    validateRequestedSlot(eventType, start, end);
    await assertSlotAvailable(eventType, start, end, env);

    const holdId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60000).toISOString();

    if (env.DB) {
        await env.DB.prepare(
            'INSERT INTO holds (id, event_type, start_utc, end_utc, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(holdId, eventType.id, start.toISOString(), end.toISOString(), expiresAt, new Date().toISOString()).run();
    }

    return { holdId, expiresAt };
}

async function createBooking(request, env) {
    const body = await readJson(request);
    const eventType = getEventType(body.eventType);
    const start = parseInstant(body.start);
    const end = parseInstant(body.end);
    const client = validateClient(body.client || {});
    validateRequestedSlot(eventType, start, end);

    if (body.holdId && env.DB) {
        await consumeHold(body.holdId, eventType, start, end, env);
    }

    await assertSlotAvailable(eventType, start, end, env);

    const calendarEvent = await insertCalendarEvent(eventType, start, end, client, env);
    const bookingId = crypto.randomUUID();
    const token = crypto.randomUUID();

    if (env.DB) {
        await env.DB.prepare(
            `INSERT INTO bookings
            (id, calendar_event_id, token, status, event_type, start_utc, end_utc, client_name, client_email, client_phone, player_name, rating, goals, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            bookingId,
            calendarEvent.id || '',
            token,
            'confirmed',
            eventType.id,
            start.toISOString(),
            end.toISOString(),
            client.name,
            client.email,
            client.phone,
            client.playerName,
            client.rating,
            client.goals,
            new Date().toISOString()
        ).run();
    }

    await sendBookingEmail(eventType, start, end, client, bookingId, env);

    return {
        bookingId,
        calendarEventId: calendarEvent.id || '',
        status: 'confirmed',
        start: start.toISOString(),
        end: end.toISOString()
    };
}

async function assertSlotAvailable(eventType, start, end, env) {
    const protectedStart = new Date(start.getTime() - AVAILABILITY_RULES.bufferBeforeMinutes * 60000);
    const protectedEnd = new Date(end.getTime() + AVAILABILITY_RULES.bufferAfterMinutes * 60000);
    const busyIntervals = await getBusyIntervals(protectedStart, protectedEnd, env);
    const heldIntervals = await getHeldIntervals(env, protectedStart, protectedEnd);

    if (overlapsAny(protectedStart, protectedEnd, busyIntervals) || overlapsAny(protectedStart, protectedEnd, heldIntervals)) {
        throw httpError(409, 'That time is no longer available.');
    }

    const availableSlots = await getAvailabilityForRange(eventType, start, env);
    if (!availableSlots.some((slot) => slot.start === start.toISOString())) {
        throw httpError(409, 'That time is outside the current booking rules.');
    }
}

async function getAvailabilityForRange(eventType, start, env) {
    const fakeRequest = new Request(`https://scheduler.local/availability?eventType=${eventType.id}&from=${localDateKey(start, HOST_TIME_ZONE)}&days=1`);
    return getAvailability(fakeRequest, env);
}

async function getBusyIntervals(start, end, env) {
    const token = await getGoogleAccessToken(env);
    const calendarId = encodeURIComponent(requiredEnv(env, 'GOOGLE_CALENDAR_ID'));
    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            items: [{ id: decodeURIComponent(calendarId) }]
        })
    });

    if (!response.ok) {
        throw httpError(502, 'Calendar availability could not be checked.');
    }

    const data = await response.json();
    return (data.calendars?.[decodeURIComponent(calendarId)]?.busy || []).map((interval) => ({
        start: new Date(interval.start),
        end: new Date(interval.end)
    }));
}

async function insertCalendarEvent(eventType, start, end, client, env) {
    const token = await getGoogleAccessToken(env);
    const calendarId = encodeURIComponent(requiredEnv(env, 'GOOGLE_CALENDAR_ID'));
    const description = [
        `Student/player: ${client.playerName || client.name}`,
        `Contact: ${client.email}${client.phone ? ` | ${client.phone}` : ''}`,
        `Rating/level: ${client.rating || 'Not provided'}`,
        `Format preference: ${client.formatPreference || eventType.format}`,
        '',
        'Goals:',
        client.goals
    ].join('\n');

    const event = {
        summary: `Pawn Island Academy - ${eventType.name}`,
        description,
        location: eventType.location,
        start: { dateTime: start.toISOString(), timeZone: HOST_TIME_ZONE },
        end: { dateTime: end.toISOString(), timeZone: HOST_TIME_ZONE },
        attendees: [{ email: client.email, displayName: client.name }],
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 60 }
            ]
        }
    };

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    });

    if (!response.ok) {
        throw httpError(502, 'Calendar event could not be created.');
    }

    return response.json();
}

async function getHeldIntervals(env, start, end) {
    if (!env.DB) return [];
    const result = await env.DB.prepare(
        `SELECT start_utc, end_utc FROM holds
         WHERE expires_at > ?
         AND start_utc < ?
         AND end_utc > ?`
    ).bind(new Date().toISOString(), end.toISOString(), start.toISOString()).all();

    return (result.results || []).map((row) => ({
        start: new Date(row.start_utc),
        end: new Date(row.end_utc)
    }));
}

async function consumeHold(holdId, eventType, start, end, env) {
    const result = await env.DB.prepare(
        `SELECT id FROM holds
         WHERE id = ?
         AND event_type = ?
         AND start_utc = ?
         AND end_utc = ?
         AND expires_at > ?`
    ).bind(holdId, eventType.id, start.toISOString(), end.toISOString(), new Date().toISOString()).first();

    if (!result) {
        throw httpError(409, 'This held time expired. Please choose it again.');
    }

    await env.DB.prepare('DELETE FROM holds WHERE id = ?').bind(holdId).run();
}

async function sendBookingEmail(eventType, start, end, client, bookingId, env) {
    if (!env.RESEND_API_KEY || !env.RESEND_FROM) return;

    const html = `
        <p>A new Pawn Island Academy lesson was booked.</p>
        <p><strong>${escapeHtml(eventType.name)}</strong><br>${escapeHtml(formatForEmail(start, end))}</p>
        <p><strong>${escapeHtml(client.name)}</strong><br>${escapeHtml(client.email)}${client.phone ? `<br>${escapeHtml(client.phone)}` : ''}</p>
        <p>${escapeHtml(client.goals)}</p>
    `;

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: env.RESEND_FROM,
            to: [env.NOTIFICATION_EMAIL || client.email],
            cc: env.NOTIFICATION_EMAIL ? [client.email] : undefined,
            subject: `Pawn Island lesson confirmed: ${eventType.name}`,
            html,
            headers: { 'X-Booking-Id': bookingId }
        })
    });
}

async function getGoogleAccessToken(env) {
    if (env.GOOGLE_ACCESS_TOKEN) return env.GOOGLE_ACCESS_TOKEN;

    const clientEmail = requiredEnv(env, 'GOOGLE_CLIENT_EMAIL');
    const privateKey = requiredEnv(env, 'GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
    const now = Math.floor(Date.now() / 1000);
    const assertion = await signJwt({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/calendar',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    }, privateKey);

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion
        })
    });

    if (!response.ok) {
        throw httpError(502, 'Calendar authentication failed.');
    }

    const data = await response.json();
    return data.access_token;
}

async function signJwt(payload, privateKeyPem) {
    const header = { alg: 'RS256', typ: 'JWT' };
    const encodedHeader = base64Url(JSON.stringify(header));
    const encodedPayload = base64Url(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey(
        'pkcs8',
        pemToArrayBuffer(privateKeyPem),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput));
    return `${signingInput}.${base64UrlBytes(signature)}`;
}

function pemToArrayBuffer(pem) {
    const base64 = pem
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
}

function base64Url(value) {
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlBytes(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function validateRequestedSlot(eventType, start, end) {
    if (end.getTime() - start.getTime() !== eventType.durationMinutes * 60000) {
        throw httpError(400, 'The requested slot duration is invalid.');
    }
}

function validateClient(client) {
    const normalized = {
        name: String(client.name || '').trim(),
        email: String(client.email || '').trim(),
        phone: String(client.phone || '').trim(),
        playerName: String(client.playerName || '').trim(),
        rating: String(client.rating || '').trim(),
        goals: String(client.goals || '').trim(),
        formatPreference: String(client.formatPreference || '').trim()
    };

    if (!normalized.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized.email) || !normalized.goals) {
        throw httpError(400, 'Name, email, and lesson goals are required.');
    }

    return normalized;
}

function getEventType(eventTypeId) {
    const eventType = EVENT_TYPES.find((item) => item.id === eventTypeId);
    if (!eventType) throw httpError(400, 'Unknown lesson type.');
    return eventType;
}

function parseInstant(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw httpError(400, 'Invalid date.');
    return date;
}

function parseDateKey(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '';
}

async function readJson(request) {
    try {
        return await request.json();
    } catch (error) {
        throw httpError(400, 'Invalid JSON request.');
    }
}

function overlapsAny(start, end, intervals) {
    return intervals.some((interval) => start < interval.end && end > interval.start);
}

function dayOfWeekForDateKey(dateKey) {
    const noonUtc = new Date(`${dateKey}T12:00:00.000Z`);
    const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: HOST_TIME_ZONE,
        weekday: 'short'
    }).format(noonUtc);
    return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday];
}

function addDaysToDateKey(dateKey, days) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
    return date.toISOString().slice(0, 10);
}

function localDateKey(value, timeZone) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(value);
}

function zonedDateTimeToUtc(dateKey, time, timeZone) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    let utc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).formatToParts(utc).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
        const asUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), 0);
        const expected = Date.UTC(year, month - 1, day, hour, minute, 0);
        utc = new Date(utc.getTime() + expected - asUtc);
    }

    return utc;
}

function formatForEmail(start, end) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: HOST_TIME_ZONE,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function requiredEnv(env, name) {
    if (!env[name]) throw httpError(500, `Missing ${name}.`);
    return env[name];
}

function json(data, request, env, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(request, env)
        }
    });
}

function corsHeaders(request, env) {
    const origin = request.headers.get('Origin') || DEFAULT_ORIGIN;
    const allowlist = (env.ALLOWED_ORIGINS || DEFAULT_ORIGIN)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    const allowedOrigin = allowlist.includes(origin) ? origin : allowlist[0] || DEFAULT_ORIGIN;

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Accept',
        'Vary': 'Origin'
    };
}

function httpError(status, publicMessage) {
    const error = new Error(publicMessage);
    error.status = status;
    error.publicMessage = publicMessage;
    return error;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
