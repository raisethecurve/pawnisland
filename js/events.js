document.addEventListener("DOMContentLoaded", function() {
    // Listen for theme changes from ThemeManager
    document.addEventListener('themeChanged', function(e) {
        // No need to call updateEventsForTheme - ThemeManager handles this now
    });
    
    // Add cache-busting parameter to prevent browser caching
    const cacheBuster = `?cache=${Date.now()}`;
    
    fetch(`../../data/events.json${cacheBuster}`, {
        // Add cache control headers to prevent caching
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
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

            // Filter events based on visibility rules
            const visibleEvents = processedEvents.filter(event => {
                // Check showAfterDate if it exists
                if (event.showAfterDate) {
                    const showAfterDate = parseDateNoOffset(event.showAfterDate);
                    
                    // If showAfterDate has not passed yet
                    if (currentDate < showAfterDate) {
                        // Only show round 1 events before their showAfterDate
                        return !event.round || event.round === 1;
                    }
                }
                
                // If no tournamentId or it's round 1, show it
                if (!event.tournamentId || !event.round || event.round === 1) {
                    return true;
                }
                
                // For round 2+, check if all previous rounds have passed
                return areAllPreviousRoundsPassed(event, events, currentDate);
            });

            // Add tournament context info to events
            visibleEvents.forEach(event => {
                if (event.tournamentId && event.round) {
                    // Find the first round of this tournament to get info
                    const tournamentFirstRound = events.find(e => 
                        e.tournamentId === event.tournamentId && (!e.round || e.round === 1)
                    );
                    
                    if (tournamentFirstRound) {
                        // Add context info for multi-round tournaments
                        if (!event.notes.includes("Part of a")) {
                            event.notes = `Part of a multi-round tournament. ${event.notes}`;
                        }
                    }
                }
            });

            // Sort and display events
            displayEvents(visibleEvents, currentDate);
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
     * Checks if all previous rounds of a tournament have passed
     */
    function areAllPreviousRoundsPassed(event, allEvents, currentDate) {
        // If no tournament ID or round, or it's round 1, no need to check
        if (!event.tournamentId || !event.round || event.round === 1) {
            return true;
        }
        
        // Find all previous rounds for this tournament
        const previousRounds = allEvents.filter(e => 
            e.tournamentId === event.tournamentId && 
            e.round && 
            e.round < event.round
        );
        
        // If we can't find any previous rounds, something is wrong with the data
        // But we'll allow the event to display anyway
        if (previousRounds.length === 0) {
            console.warn(`No previous rounds found for ${event.name} (round ${event.round})`);
            return true;
        }
        
        // Check that all previous rounds have dates that have passed
        return previousRounds.every(prevRound => {
            const prevRoundDate = parseDateNoOffset(prevRound.startdate);
            return currentDate >= prevRoundDate;
        });
    }

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
        const isMonthlyEvent = event.recurrence.frequency === "monthly";
        const weekOfMonth = event.recurrence.weekOfMonth; // For monthly events that occur on specific week
        
        console.log(`Processing recurring event: ${event.name}, frequency=${event.recurrence.frequency}, dayOfWeek=${dayOfWeek} (${getDayName(dayOfWeek)})`);
        
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
        
        // Function to check if a date is the nth occurrence of the specified day in its month
        function isNthOccurrenceInMonth(date, targetDayOfWeek, n) {
            const year = date.getFullYear();
            const month = date.getMonth();
            
            // Count occurrences of this day in the month
            let count = 0;
            let testDate = new Date(year, month, 1);
            
            while (testDate.getMonth() === month) {
                if (testDate.getDay() === targetDayOfWeek) {
                    count++;
                    
                    // If we've found the nth occurrence and it's the same date
                    if (count === n && testDate.getDate() === date.getDate()) {
                        return true;
                    }
                }
                testDate.setDate(testDate.getDate() + 1);
            }
            
            return false;
        }
        
        // Function to get the nth occurrence of a day in a given month/year
        function getNthDayOfMonth(year, month, dayOfWeek, n) {
            let count = 0;
            let testDate = new Date(year, month, 1);
            
            while (testDate.getMonth() === month) {
                if (testDate.getDay() === dayOfWeek) {
                    count++;
                    if (count === n) {
                        return new Date(testDate);
                    }
                }
                testDate.setDate(testDate.getDate() + 1);
            }
            
            return null; // Not found (e.g., 5th Wednesday in a month with only 4)
        }
        
        // Generate all occurrences within our window
        const startWindow = new Date(currentDate);
        startWindow.setMonth(startWindow.getMonth() - 3); // Look back 3 months
        
        const endWindow = new Date(currentDate);
        endWindow.setFullYear(endWindow.getFullYear() + 1); // Look ahead 1 year
        
        const allOccurrences = [];
        
        if (isMonthlyEvent && weekOfMonth) {
            // Handle monthly events that occur on a specific week of the month
            let checkMonth = new Date(startWindow);
            // Start from beginning of the month
            checkMonth.setDate(1);
            
            while (checkMonth <= endWindow) {
                // Get the nth occurrence of the day in this month
                const occurrence = getNthDayOfMonth(
                    checkMonth.getFullYear(),
                    checkMonth.getMonth(),
                    dayOfWeek,
                    weekOfMonth
                );
                
                if (occurrence) {
                    const dateStr = occurrence.toISOString().split('T')[0];
                    
                    // Skip exception dates
                    if (!exceptions.has(dateStr)) {
                        allOccurrences.push({
                            date: new Date(occurrence),
                            dateStr: dateStr,
                            isPast: occurrence < currentDate
                        });
                        
                        console.log(`Added monthly: ${occurrence.toDateString()}, isPast=${occurrence < currentDate}`);
                    }
                }
                
                // Move to next month
                checkMonth.setMonth(checkMonth.getMonth() + 1);
            }
        } else {
            // Handle weekly events (original logic)
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
                    
                    console.log(`Added weekly: ${checkDate.toDateString()}, isPast=${checkDate < currentDate}, isFifthDay=${isFifthDay}`);
                }
                
                // Move to next week
                checkDate.setDate(checkDate.getDate() + 7);
            }
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
                
                // Add speed tag for fifth Thursday blitz events
                if (!pastEvent.tags) {
                    pastEvent.tags = [];
                }
                if (!pastEvent.tags.includes("speed")) {
                    pastEvent.tags.push("speed");
                }
            }
            
            results.push(pastEvent);
        }
        
        // For monthly events, add all future occurrences
        if (isMonthlyEvent) {
            const futureOccurrences = allOccurrences.filter(item => !item.isPast);
            futureOccurrences.sort((a, b) => a.date - b.date);
            
            futureOccurrences.forEach(occurrence => {
                results.push({
                    ...event,
                    startdate: occurrence.dateStr,
                    isRecurring: true,
                    isPast: false,
                    days: getDayName(dayOfWeek)
                });
            });
        } else {
            // For weekly events, use original logic
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
                    
                    // Create the blitz event with the speed tag
                    const blitzEvent = {
                        ...event,
                        startdate: nextBlitz.dateStr,
                        name: "Cranston Big Money Blitz Brawl",
                        isRecurring: true,
                        isBlitzEvent: true,
                        isPast: false,
                        days: getDayName(dayOfWeek),
                        entry_fee: "$20.00",
                        time_control: "USCF Blitz G/5;d0"
                    };
                    
                    // Add the speed tag
                    if (!blitzEvent.tags) {
                        blitzEvent.tags = [];
                    }
                    if (!blitzEvent.tags.includes("speed")) {
                        blitzEvent.tags.push("speed");
                    }
                    
                    results.push(blitzEvent);
                }
            }
        }
        
        return results;
    }
    function displayEvents(events, currentDate) {
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = '';

        // Sort events by date
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

        // Completely new tournament grouping logic
        const groupedEvents = [];
        const processedEventIds = new Set();
        
        // First, identify all tournament IDs and their events
        const tournamentGroups = {};
        
        events.forEach((event, index) => {
            if (!event.tournamentId) {
                // Non-tournament events are added directly
                groupedEvents.push(event);
                return;
            }
            
            // Give each event a unique ID for tracking
            const eventId = `${index}-${event.name}-${event.startdate}`;
            
            // If this tournament hasn't been seen yet, create an entry for it
            if (!tournamentGroups[event.tournamentId]) {
                tournamentGroups[event.tournamentId] = [];
            }
            
            // Add this event to its tournament group with its unique ID
            tournamentGroups[event.tournamentId].push({
                event: event,
                eventId: eventId,
                date: parseDateNoOffset(event.startdate)
            });
        });
        
        // Process each tournament group
        Object.keys(tournamentGroups).forEach(tournamentId => {
            const tournamentEvents = tournamentGroups[tournamentId];
            
            // Sort tournament events by date
            tournamentEvents.sort((a, b) => a.date - b.date);
            
            // Group events into proper tournament series based on date proximity
            const tournamentSeries = [];
            let currentSeries = [];
            
            tournamentEvents.forEach((eventData, index) => {
                // If this event has already been processed, skip it
                if (processedEventIds.has(eventData.eventId)) {
                    return;
                }
                
                // Start a new series or continue the current one
                if (currentSeries.length === 0) {
                    currentSeries.push(eventData);
                } else {
                    const lastEvent = currentSeries[currentSeries.length - 1];
                    
                    // Check if this event is close in time to the last event
                    // For weekly tournaments, we use 35 days as max gap
                    const daysBetween = Math.round((eventData.date - lastEvent.date) / (1000 * 60 * 60 * 24));
                    
                    if (daysBetween <= 35) {
                        // Same tournament series
                        currentSeries.push(eventData);
                    } else {
                        // This is a new tournament series
                        tournamentSeries.push([...currentSeries]);
                        currentSeries = [eventData];
                    }
                }
                
                // If this is the last event, add the current series
                if (index === tournamentEvents.length - 1 && currentSeries.length > 0) {
                    tournamentSeries.push([...currentSeries]);
                }
            });
            
            // Process each tournament series
            tournamentSeries.forEach(series => {
                // Mark all events in this series as processed
                series.forEach(eventData => {
                    processedEventIds.add(eventData.eventId);
                });
                
                // Sort the series by round number if available
                series.sort((a, b) => {
                    const roundA = a.event.round || 0;
                    const roundB = b.event.round || 0;
                    return roundA - roundB;
                });
                
                // Add all events from this series to the grouped events
                series.forEach(eventData => {
                    groupedEvents.push(eventData.event);
                });
            });
        });
        
        // Final re-sort to ensure correct chronological order
        groupedEvents.sort((a, b) => {
            const dateA = parseDateNoOffset(a.startdate);
            const dateB = parseDateNoOffset(b.startdate);
            const aIsPast = dateA < currentDate;
            const bIsPast = dateB < currentDate;
            
            if (aIsPast !== bIsPast) {
                return aIsPast ? 1 : -1;
            }
            return dateA - dateB;
        });

        // Display events with improved AOS setup
        groupedEvents.forEach((event, index) => {
            const eventCard = createEventCard(event, currentDate, index);
            eventsContainer.appendChild(eventCard);
        });
        
        // Refresh organizer filter after events are loaded
        if (typeof window.refreshOrganizerFilter === 'function') {
            window.refreshOrganizerFilter();
        }
        
        // Ensure AOS is refreshed after all events are loaded
        setTimeout(() => {
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }, 100);
    }

// Define the badge system with proper ordering
const BADGE_DEFINITIONS = [
    { id: 'weekly', label: 'Weekly Event', icon: 'fa-redo-alt', class: 'badge-info' },
    { id: 'monthly', label: 'Monthly Event', icon: 'fa-calendar-alt', class: 'badge-info' },
    { id: 'discount', label: 'Discount Available', icon: 'fa-tags', class: 'badge-success' },
    { id: 'free-entry', label: 'Free Entry', icon: 'fa-ticket-alt', class: 'badge-success' },
    { id: 'scholastic', label: 'Scholastic', icon: 'fa-graduation-cap', class: 'badge-primary' },
    { id: 'collegiate', label: 'Collegiate', icon: 'fa-university', class: 'badge-primary' }, // New collegiate badge
    { id: 'seniors', label: 'Seniors', icon: 'fa-user-clock', class: 'badge-secondary' }, // New seniors badge
    { id: 'adults-only', label: 'Adults Only', icon: 'fa-users', class: 'badge-danger' },
    { id: 'broadcast', label: 'Broadcast', icon: 'fa-video', class: 'badge-info' },
    { id: 'fundraiser', label: 'Fundraiser', icon: 'fa-hand-holding-heart', class: 'badge-warning' },
    { id: 'speed', label: 'Speed Chess', icon: 'fa-bolt', class: 'badge-danger' }, // New speed badge for blitz/rapid
    { id: 'online', label: 'Online', icon: 'fa-laptop', class: 'badge-secondary' },
    { id: 'gprix', label: 'Grand Prix', icon: 'fa-coins', class: 'badge-warning' }, // badge indicates grand prix points
    { id: 'regional', label: 'Regional', icon: 'fa-map-marker-alt', class: 'badge-secondary' },
    { id: 'national', label: 'National', icon: 'fa-flag', class: 'badge-primary' },
    { id: 'international', label: 'International', icon: 'fa-globe', class: 'badge-primary' },
    { id: 'professional', label: 'Professional', icon: 'fa-chess-queen', class: 'badge-dark' },
    { id: 'team', label: 'Team Event', icon: 'fa-users', class: 'badge-info' }, // team badge for team events
    { id: 'memorial', label: 'Memorial', icon: 'fa-ribbon', class: 'badge-primary' }
];

/* 
 * AVAILABLE BADGE IDs FOR EVENTS.JSON:
 * -----------------------------------
 * To use any of these badges, include a "tags" array in your event with any of these identifiers:
 * 
 * - weekly         : For recurring weekly events
 * - monthly        : For recurring monthly events
 * - discount       : When discounts are available (automatically added if promo_code exists)
 * - free-entry     : For events with no entry fee
 * - scholastic     : For youth/K-12 events
 * - collegiate     : For university/college events
 * - seniors        : For events targeting older players (50+, etc.)
 * - adults-only    : For 18+ or 21+ events
 * - broadcast      : For events with livestreams/broadcasts
 * - fundraiser     : For charity or fundraising events
 * - online         : For virtual events
 * - gprix          : For events that are part of a Grand Prix series
 * - regional       : For state or regional championships
 * - national       : For national championships
 * - international  : For international events
 * - professional   : For events with title norms, FIDE rated, etc.
 * - speed          : For blitz, bullet, or rapid events
 */

// Helper function to detect event badges based solely on event tags
function detectEventBadges(event) {
    const badges = [];
    
    // Only use explicit tags from the event data
    // No more context-based detection
    if (event.tags && Array.isArray(event.tags)) {
        // Process each tag in the event
        event.tags.forEach(tag => {
            // Convert tag to lowercase for case-insensitive matching
            const normalizedTag = tag.toLowerCase();
            
            // Match tags to badge IDs directly
            const validBadgeIds = BADGE_DEFINITIONS.map(badge => badge.id);
            
            // If the normalized tag matches a badge ID, add it
            if (validBadgeIds.includes(normalizedTag)) {
                badges.push(normalizedTag);
            }
        });
    }
    
    // Special case for recurring events based on frequency
    if (event.isRecurring && event.recurrence) {
        if (event.recurrence.frequency === "monthly") {
            badges.push('monthly');
        } else if (event.recurrence.frequency === "weekly") {
            badges.push('weekly');
        }
    }
    
    // Special case for promo code events that should have discount badge
    if (event.promo_code) {
        badges.push('discount');
    }
    
    return badges;
}

// Function to generate badge HTML
function generateBadgesHTML(event) {
    const badges = detectEventBadges(event);
    
    if (badges.length === 0) {
        return '';
    }
    
    // Create badges container
    let badgesHTML = '<div class="event-badges-container">';
    
    // Add each badge in order of BADGE_DEFINITIONS
    BADGE_DEFINITIONS.forEach(badgeDef => {
        if (badges.includes(badgeDef.id)) {
            badgesHTML += `
                <div class="event-badge badge ${badgeDef.class}">
                    <i class="fas ${badgeDef.icon}"></i>
                    <span>${badgeDef.label}</span>
                </div>
            `;
        }
    });
    
    badgesHTML += '</div>';
    return badgesHTML;
}

// Function to create event card, updated with badge system
function createEventCard(event, currentDate, cardIndex = 0) {
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
    eventCard.className = `col-12 event-item ${isPast ? 'past-event' : 'upcoming-event'}`;
    
    // Improved AOS setup with progressive delays
    eventCard.setAttribute('data-aos', 'fade-up');
    
    // Calculate progressive delay, capping at reasonable maximum
    const delay = Math.min(cardIndex * 50, 800);
    eventCard.setAttribute('data-aos-delay', delay);
    
    // Add additional AOS attributes for better control
    eventCard.setAttribute('data-aos-duration', '600');
    eventCard.setAttribute('data-aos-easing', 'ease-out-cubic');
    
    // Add organizer data attribute for filtering
    if (event.organizer) {
        eventCard.setAttribute('data-organizer', event.organizer.trim());
    }
    
    // Check if event has a promo code
    const hasPromo = event.promo_code ? true : false;
    
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
    
    let organizerSection = event.organizer ? `<h6 class="card-subtitle mb-2 text-muted">${event.organizer}</h6>` : '';
    let nameSection = event.name ? `<h5 class="card-title">${event.name}</h5>` : '';
    let whenSection = `<p class="card-text event-info"><strong>When:</strong> ${dateDisplay}</p>`;
    let locationSection = event.location ? `<p class="card-text event-info"><strong>Location:</strong> ${event.location}</p>` : '';
    let addressSection = event.address ? `<p class="card-text event-info"><strong>Address:</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(event.address)}" target="_blank" class="link-prevent-default">${event.address}</a></p>` : '';
    let sectionsSection = event.sections ? `<p class="card-text event-info"><strong>Sections:</strong> ${event.sections}</p>` : '';
    let entryFeeSection = event.entry_fee ? `<p class="card-text event-info"><strong>Entry Fee:</strong> ${event.entry_fee}</p>` : '';
    let timeControlSection = event.time_control ? `<p class="card-text event-info"><strong>Time Control:</strong> ${event.time_control}</p>` : '';
    let formatSection = event.format ? `<p class="card-text event-info"><strong>Format:</strong> ${event.format}</p>` : '';
    let roundTimesSection = event.round_times ? `<p class="card-text event-info"><strong>Round Times:</strong> ${event.round_times}</p>` : '';
    let prizesSection = event.prizes ? `<p class="card-text event-info"><strong>Prizes:</strong> ${event.prizes}</p>` : '';
    let prixPoints = event.prix_points ? `<p class="card-text event-info"><strong>Grand Prix Points:</strong> ${event.prix_points}</p>` : '';
    let ageSection = event.ages ? `<p class="card-text event-info"><strong>Age Range:</strong> ${event.ages}</p>` : '';
    
    // Only show View Details link if there's no promo code
    let linkSection = '';
    if (event.link && !event.promo_code) {
        linkSection = `<a href="${event.link}" target="_blank" class="btn btn-primary btn-custom organizer-link" onclick="event.stopPropagation();">View Details</a>`;
    }
    
    // Add registration button with promo code if available
    let registrationSection = '';
    let promoBadge = ''; // This variable is no longer used for displaying badges
    if (event.promo_code) {
        const registrationUrl = event.registration_link || event.link || '#';
        registrationSection = `
            <div class="mt-3">
                <a href="${registrationUrl}" target="_blank" class="btn btn-success btn-custom register-button" onclick="event.stopPropagation();">
                    <i class="fas fa-ticket-alt mr-2"></i>Register with 10% discount: <strong>${event.promo_code}</strong>
                </a>
            </div>
        `;
        
        // Remove the old promo badge - it's now handled by the badge system
        // promoBadge = `<div class="promo-badge">10% DISCOUNT</div>`;
    }

    // REMOVE OLD recurring event badge completely
    let recurringBadge = '';

    // Get badges HTML
    const badgesHTML = generateBadgesHTML(event);
    
    // Update event card HTML to include badges in the right position but remove old badges
    eventCard.innerHTML = `
        <div class="card event-card h-100 ${isEventPast ? 'bg-light text-dark' : cardThemeClass} ${hasPromo ? 'promo-card' : ''}">
            <div class="position-relative">
                <div class="event-date">${formattedDateLabel}</div>
                <div class="event-img-container">
                    <img src="${event.image}" class="event-img" alt="${event.name || 'Event'}" loading="lazy">
                    ${badgesHTML}
                </div>
                ${isEventPast ? '<div class="past-event-overlay">Event Passed</div>' : ''}
            </div>
            <div class="card-body">
                ${nameSection}
                ${organizerSection}
                ${whenSection}
                ${locationSection}
                ${addressSection}
                ${sectionsSection}
                ${entryFeeSection}
                ${timeControlSection}
                ${formatSection}
                ${roundTimesSection}
                ${prizesSection}
                ${prixPoints}
                ${ageSection}
                ${linkSection}
                ${registrationSection}
            </div>
            ${noteSection}
        </div>
    `;
    
    // Add event listeners after the card is created to ensure links work
    setTimeout(() => {
        const links = eventCard.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    }, 0);
    
    return eventCard;
}

// Add CSS styling for badges directly to the document to avoid needing a new CSS file
document.addEventListener('DOMContentLoaded', function() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .event-badges-container {
            position: absolute;
            top: 15px;
            left: 15px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            z-index: 5;
        }
        
        .event-badge {
            display: flex;
            align-items: center;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0.95;
            transition: all 0.3s ease;
            backdrop-filter: blur(1px);
        }
        
        .event-badge:hover {
            transform: translateX(3px);
            opacity: 1;
        }
        
        .event-badge i {
            margin-right: 5px;
        }
        
        .badge-info {
            background-color: #17a2b8;
        }
        
        .badge-success {
            background-color: #28a745;
        }
        
        .badge-primary {
            background-color: #007bff;
        }
        
        .badge-secondary {
            background-color: #6c757d;
        }
        
        .badge-warning {
            background-color: #ffc107;
            color: #212529;
        }
        
        .badge-danger {
            background-color: #dc3545;
        }
        
        .badge-dark {
            background-color: #343a40;
        }
    `;
    document.head.appendChild(styleElement);
});

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

    // Add global handler to fix link clicking issues
    document.body.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            e.stopPropagation();
        }
    }, true);

    // Run initial filtering when events are loaded
    setTimeout(() => {
        // Check if events are loaded and show only upcoming events
        if (document.querySelectorAll('.event-item').length > 0) {
            initializeEvents();
        }
    }, 1000); // Give time for events to load
});

// Add this function to automatically filter for upcoming events when the page loads
function initializeEvents() {
    // Automatically filter to show only upcoming events
    const events = document.querySelectorAll('.event-item');
    events.forEach(event => {
        if (event.classList.contains('past-event')) {
            event.style.display = 'none';
        } else {
            event.style.display = 'block';
        }
    });
}