document.addEventListener("DOMContentLoaded", function() {
    // Listen for theme changes from ThemeManager
    document.addEventListener('themeChanged', function(e) {
        // No need to call updateEventsForTheme - ThemeManager handles this now
    });
    
    fetch('../../data/events.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(events => {
            const processedEvents = [];
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
            
            events.forEach(event => {
                if (event.recurrence) {
                    // Handle recurring events
                    const recurringEvents = processRecurringEvent(event, currentDate);
                    processedEvents.push(...recurringEvents);
                } else {
                    // Non-recurring events are added as-is
                    processedEvents.push(event);
                }
            });

            // Sort and display events
            displayEvents(processedEvents, currentDate);
        })
        .catch(error => {
            console.error('Error loading events:', error);
            document.getElementById('events-container').innerHTML = `
                <div class="col-12 text-center">
                    <p class="alert alert-danger">Failed to load events. Please try again later.</p>
                </div>
            `;
        });

    /**
     * Process a recurring event into its instances
     */
    function processRecurringEvent(event, currentDate) {
        const results = [];
        // Updated to use event.startdate if event.date is not provided
        const baseDate = parseDateNoOffset(event.startdate);
        const dayOfWeek = event.recurrence.dayOfWeek; // 0-6, where 0 is Sunday
        const exceptions = new Set(event.recurrence.exceptions || []);
        const isCranstonChess = event.name.includes("Cranston");
        
        console.log(`Processing recurring event: ${event.name}, dayOfWeek=${dayOfWeek} (${getDayName(dayOfWeek)})`);
        
        // Function to get day name for logging
        function getDayName(dayIndex) {
            return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
        }
        
        // Function to check if a date is the 5th occurrence of the specified day in its month
        function isFifthOccurrenceInMonth(date, targetDayOfWeek) {
            const year = date.getFullYear();
            const month = date.getMonth();
            
            // Count occurrences of this day in the month
            let count = 0;
            let testDate = new Date(year, month, 1);
            
            while (testDate.getMonth() === month) {
                if (testDate.getDay() === targetDayOfWeek) {
                    count++;
                    
                    // If we've found the 5th occurrence and it's the same date
                    if (count === 5 && testDate.getDate() === date.getDate()) {
                        return true;
                    }
                }
                testDate.setDate(testDate.getDate() + 1);
            }
            
            return false;
        }
        
        // Generate all occurrences within our window
        const startWindow = new Date(currentDate);
        startWindow.setMonth(startWindow.getMonth() - 3); // Look back 3 months
        
        const endWindow = new Date(currentDate);
        endWindow.setFullYear(endWindow.getFullYear() + 1); // Look ahead 1 year
        
        // Start from base date or earlier to capture all relevant occurrences
        let checkDate = new Date(baseDate);
        
        // If base date is after start window, move back in time until we're before start window
        while (checkDate > startWindow) {
            checkDate.setDate(checkDate.getDate() - 7);
        }
        
        // Now move forward until we're in our window
        while (checkDate < startWindow) {
            checkDate.setDate(checkDate.getDate() + 7);
        }
        
        // Adjust checkDate so it matches the target day of week before generating occurrences
        while (checkDate.getDay() !== dayOfWeek) {
            checkDate.setDate(checkDate.getDate() + 1);
        }
        
        const allOccurrences = [];
        
        // Generate all weekly occurrences within our window
        console.log(`Generating occurrences from ${checkDate.toDateString()} to ${endWindow.toDateString()}`);
        while (checkDate <= endWindow) {
            const dateStr = checkDate.toISOString().split('T')[0];
            
            // Skip exception dates
            if (!exceptions.has(dateStr)) {
                // Check if this is a 5th occurrence of the day in its month
                const isFifthDay = isFifthOccurrenceInMonth(checkDate, dayOfWeek);
                
                allOccurrences.push({
                    date: new Date(checkDate),
                    dateStr: dateStr,
                    isPast: checkDate < currentDate,
                    isFifthDay: isFifthDay
                });
                
                console.log(`Added ${checkDate.toDateString()}, isPast=${checkDate < currentDate}, isFifthDay=${isFifthDay}`);
            }
            
            // Move to next week
            checkDate.setDate(checkDate.getDate() + 7);
        }
        
        // Find most recent past event (including blitz)
        const pastOccurrences = allOccurrences.filter(item => item.isPast);
        if (pastOccurrences.length > 0) {
            pastOccurrences.sort((a, b) => b.date - a.date);
            const mostRecentPast = pastOccurrences[0];
            
            const pastEvent = {
                ...event,
                startdate: mostRecentPast.dateStr,
                isRecurring: true,
                isPast: true,
                days: getDayName(dayOfWeek)
            };
            
            // Apply special handling for fifth Thursday blitz events
            if (isCranstonChess && mostRecentPast.isFifthDay) {
                pastEvent.name = "Cranston Big Money Blitz Brawl";
                pastEvent.isBlitzEvent = true;
                pastEvent.entry_fee = "$20.00";
                pastEvent.time_control = "USCF Blitz";
            }
            
            results.push(pastEvent);
        }
        
        // Find next upcoming regular event
        const upcomingRegular = allOccurrences.filter(item => !item.isPast && !item.isFifthDay);
        if (upcomingRegular.length > 0) {
            upcomingRegular.sort((a, b) => a.date - b.date);
            const nextRegular = upcomingRegular[0];
            
            results.push({
                ...event,
                startdate: nextRegular.dateStr,
                isRecurring: true,
                isPast: false,
                days: getDayName(dayOfWeek)
            });
        }
        
        // If this is Cranston Chess, also find the next blitz event (5th Thursday)
        if (isCranstonChess) {
            const upcomingBlitz = allOccurrences.filter(item => !item.isPast && item.isFifthDay);
            if (upcomingBlitz.length > 0) {
                upcomingBlitz.sort((a, b) => a.date - b.date);
                const nextBlitz = upcomingBlitz[0];
                
                results.push({
                    ...event,
                    startdate: nextBlitz.dateStr,
                    name: "Cranston Big Money Blitz Brawl",
                    isRecurring: true,
                    isBlitzEvent: true,
                    isPast: false,
                    days: getDayName(dayOfWeek),
                    entry_fee: "$20.00",
                    time_control: "USCF Blitz G/5;d0"
                });
            }
        }
        
        return results;
    }
    function displayEvents(events, currentDate) {
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = '';

        // Sort events
        events.sort((a, b) => {
            const dateA = parseDateNoOffset(a.startdate);
            const dateB = parseDateNoOffset(b.startdate);
            const aIsPast = dateA < currentDate;
            const bIsPast = dateB < currentDate;
            
            if (aIsPast !== bIsPast) {
                return aIsPast ? 1 : -1;
            }
            return dateA - dateB;
        });

        // Display events
        events.forEach(event => {
            const eventCard = createEventCard(event, currentDate);
            eventsContainer.appendChild(eventCard);
        });
    }

    function createEventCard(event, currentDate) {
        // Updated: use event.date or fallback to event.startdate
        const eventDate = parseDateNoOffset(event.startdate);
        const isPast = eventDate < currentDate;
        
        // Format the date nicely
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = eventDate.toLocaleDateString('en-US', options);

        // Format the date with ordinal suffix
        const day = eventDate.getUTCDate();
        const ordinalSuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        const formattedDateWithSuffix = `${eventDate.toLocaleString('en-US', { month: 'long' })} ${day}${ordinalSuffix(day)}, ${eventDate.getUTCFullYear()}`;
        
        const eventCard = document.createElement('div');
        eventCard.className = `col-12 mb-4 event-item ${isPast ? 'past-event' : 'upcoming-event'}`;
        eventCard.setAttribute('data-aos', 'fade-up');
        eventCard.setAttribute('data-aos-delay', 100);
        
        const cardThemeClass = 'bg-light text-dark';
        const mutedClass = 'text-muted';
        
        // Parse the start date and determine if it's a multi-day event
        const eventStartDate = parseDateNoOffset(event.startdate);
        const isEventPast = eventStartDate < currentDate;

        // Fix the days parsing to ensure proper handling of string values
        const eventDays = event.days ? parseInt(event.days, 10) : 1;
        
        // Format date with ordinal suffix
        function formatDateWithOrdinal(date) {
            const day = date.getUTCDate();
            const month = date.toLocaleString('en-US', { month: 'long' });
            const year = date.getUTCFullYear();
            
            const ordinalSuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
            };
            
            return `${month} ${day}${ordinalSuffix(day)}, ${year}`;
        }
        
        // Get day name
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[eventStartDate.getUTCDay()];
        
        // Use short day names for start and full day names for end
        const shortDayNames = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
        const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // Format the date display based on event duration - simplified logic for clarity
        let dateDisplay = '';
        // Ensure we only use the multi-day format when days is GREATER THAN 1 (not just different from 1)
        if (!eventDays || eventDays <= 1) {
            // Single day event - no date range
            dateDisplay = `${shortDayNames[eventStartDate.getUTCDay()]} ${formatDateWithOrdinal(eventStartDate)}`;
        } else {
            // Multi-day event handling with try/catch
            try {
                const eventEndDate = new Date(eventStartDate);
                eventEndDate.setUTCDate(eventStartDate.getUTCDate() + (eventDays - 1));
                
                const startDayShort = shortDayNames[eventStartDate.getUTCDay()];
                // Changed to use short day name for end date as well
                const endDayShort = shortDayNames[eventEndDate.getUTCDay()];
                
                const startMonth = eventStartDate.toLocaleString('en-US', { month: 'long' });
                const endMonth = eventEndDate.toLocaleString('en-US', { month: 'long' });
                
                const startDay = eventStartDate.getUTCDate();
                const endDay = eventEndDate.getUTCDate();
                
                // Format with ordinal suffixes
                const startDayWithSuffix = `${startDay}${ordinalSuffix(startDay)}`;
                const endDayWithSuffix = `${endDay}${ordinalSuffix(endDay)}`;
                
                const year = eventStartDate.getUTCFullYear();
                
                if (startMonth === endMonth) {
                    dateDisplay = `${startDayShort} ${startMonth} ${startDayWithSuffix} - ${endDayShort} ${endMonth} ${endDayWithSuffix}, ${year}`;
                } else {
                    dateDisplay = `${startDayShort} ${startMonth} ${startDayWithSuffix} - ${endDayShort} ${endMonth} ${endDayWithSuffix}, ${year}`;
                }
            } catch(e) {
                // Fallback in case of any date calculation errors
                console.error('Date calculation error:', e);
                dateDisplay = `${shortDayNames[eventStartDate.getUTCDay()]} ${formatDateWithOrdinal(eventStartDate)}`;
            }
        }
        
        // Format the simple date for display in card
        const dateLabelOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDateLabel = eventStartDate.toLocaleDateString('en-US', dateLabelOptions);
        
        // Conditionally create each section only if data exists
        let noteSection = event.notes ? `
            <div class="card-footer bg-light">
            <strong>Coach's Note:</strong> ${event.notes}
            </div>
        ` : '';
        
        let organizerSection = event.organizer ? `<h5 class="card-title">${event.organizer}</h5>` : '';
        let nameSection = event.name ? `<h6 class="card-subtitle mb-2 ${mutedClass}">${event.name}</h6>` : '';
        let whenSection = `<p class="card-text event-info"><strong>When:</strong> ${dateDisplay}</p>`;
        let locationSection = event.location ? `<p class="card-text event-info"><strong>Location:</strong> ${event.location}</p>` : '';
        let addressSection = event.address ? `<p class="card-text event-info"><strong>Address:</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(event.address)}" target="_blank">${event.address}</a></p>` : '';
        let sectionsSection = event.sections ? `<p class="card-text event-info"><strong>Sections:</strong> ${event.sections}</p>` : '';
        let entryFeeSection = event.entry_fee ? `<p class="card-text event-info"><strong>Entry Fee:</strong> ${event.entry_fee}</p>` : '';
        let timeControlSection = event.time_control ? `<p class="card-text event-info"><strong>Time Control:</strong> ${event.time_control}</p>` : '';
        let formatSection = event.format ? `<p class="card-text event-info"><strong>Format:</strong> ${event.format}</p>` : '';
        let roundTimesSection = event.round_times ? `<p class="card-text event-info"><strong>Round Times:</strong> ${event.round_times}</p>` : '';
        let prizesSection = event.prizes ? `<p class="card-text event-info"><strong>Prizes:</strong> ${event.prizes}</p>` : '';
        let ageSection = event.ages ? `<p class="card-text event-info"><strong>Age Range:</strong> ${event.ages}</p>` : '';
        let linkSection = event.link ? 
            `<a href="${event.link}" target="_blank" class="btn btn-primary btn-custom organizer-link">View Details</a>` : '';
        
        // Add recurring event badge
        let recurringBadge = '';
        if (event.isRecurring) {
            let badgeClass, badgeText, iconClass;
            
            if (event.isBlitzEvent) {
            badgeClass = 'badge-warning';
            badgeText = 'Special Blitz Event';
            iconClass = 'fa-bolt';
            } else {
            badgeClass = 'badge-info';
            badgeText = 'Weekly Event';
            iconClass = 'fa-redo-alt';
            }
            
            recurringBadge = `
            <div class="position-absolute" style="top: 15px; left: 15px; z-index: 2;">
                <span class="badge ${badgeClass}">
                <i class="fas ${iconClass}"></i> ${badgeText}
                </span>
            </div>
            `;
        }

        eventCard.innerHTML = `
            <div class="card event-card h-100 ${isEventPast ? 'bg-light text-dark' : cardThemeClass}">
            <div class="position-relative">
                <div class="event-date">${formattedDateLabel}</div>
                <div class="event-img-container">
                <img src="${event.image}" class="event-img" alt="${event.name || 'Event'}" loading="lazy">
                </div>
                ${isEventPast ? '<div class="past-event-overlay">Event Passed</div>' : ''}
                ${recurringBadge}
            </div>
            <div class="card-body">
                ${organizerSection}
                ${nameSection}
                ${whenSection}
                ${locationSection}
                ${addressSection}
                ${sectionsSection}
                ${entryFeeSection}
                ${timeControlSection}
                ${formatSection}
                ${roundTimesSection}
                ${prizesSection}
                ${ageSection}
                ${linkSection}
            </div>
            ${noteSection}
            </div>
        `;
        
        return eventCard;
        }

        // Helper function to trigger filtering
        function triggerFilter(filter) {
        const eventCards = document.querySelectorAll('.event-item');
        let visibleCount = 0;
        
        eventCards.forEach(card => {
            const isPast = card.classList.contains('past-event');
            
            if (filter === 'all' || 
            (filter === 'upcoming' && !isPast) || 
            (filter === 'past' && isPast)) {
            card.style.display = 'block';
            visibleCount++;
            } else {
            card.style.display = 'none';
            }
        });
        
        // Show/hide no events message
        const noEventsMessage = document.getElementById('no-events-message');
        if (noEventsMessage) {
            if (visibleCount === 0) {
            noEventsMessage.style.display = 'block';
            } else {
            noEventsMessage.style.display = 'none';
            }
        }
        }
        
        // The triggerFilter and updateEventsForTheme functions are referenced elsewhere
        // in the codebase, so we're keeping them for compatibility

        function parseDateNoOffset(dateString) {
        const [year, month, day] = dateString.split('-');
        // Set time to noon UTC to avoid timezone issues affecting the displayed day
        return new Date(Date.UTC(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            12, 0, 0 // noon UTC
        ));
        }
    });
