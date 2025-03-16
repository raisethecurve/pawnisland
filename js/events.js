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

            // Filter events based on visibility rules
            const visibleEvents = processedEvents.filter(event => {
                // If the event is not part of a tournament or is round 1, always show it
                if (!event.tournamentId || !event.round || event.round === 1) {
                    return true;
                }
                
                // For round 2+, check if all previous rounds have passed
                const allPreviousRoundsPassed = areAllPreviousRoundsPassed(event, events, currentDate);
                return allPreviousRoundsPassed;
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

            // Extract all unique organizers for filtering
            const organizers = [...new Set(visibleEvents
                .filter(event => event.organizer)
                .map(event => event.organizer))];
            
            // Sort organizers alphabetically
            organizers.sort();
            
            // Create organizer filters
            createOrganizerFilters(organizers);
            
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

        // Group tournaments together for better display
        const groupedEvents = [];
        const processedTournaments = new Set();
        
        events.forEach(event => {
            // If event is part of a tournament and not already processed
            if (event.tournamentId && !processedTournaments.has(event.tournamentId)) {
                // Find all visible events from this tournament
                const tournamentEvents = events.filter(e => e.tournamentId === event.tournamentId);
                
                if (tournamentEvents.length > 0) {
                    // Sort by round number if available
                    tournamentEvents.sort((a, b) => {
                        if (a.round && b.round) return a.round - b.round;
                        if (a.round) return -1;
                        if (b.round) return 1;
                        return 0;
                    });
                    
                    // Add all tournament events
                    tournamentEvents.forEach(e => groupedEvents.push(e));
                    processedTournaments.add(event.tournamentId);
                }
            } 
            // If not part of a tournament or already processed tournament, add normally
            else if (!event.tournamentId || processedTournaments.has(event.tournamentId)) {
                groupedEvents.push(event);
            }
        });

        // Display events
        groupedEvents.forEach(event => {
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
        
        let organizerSection = event.organizer ? `<h5 class="card-title">${event.organizer}</h5>` : '';
        let nameSection = event.name ? `<h6 class="card-subtitle mb-2 ${mutedClass}">${event.name}</h6>` : '';
        let whenSection = `<p class="card-text event-info"><strong>When:</strong> ${dateDisplay}</p>`;
        let locationSection = event.location ? `<p class="card-text event-info"><strong>Location:</strong> ${event.location}</p>` : '';
        let addressSection = event.address ? `<p class="card-text event-info"><strong>Address:</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(event.address)}" target="_blank" class="link-prevent-default">${event.address}</a></p>` : '';
        let sectionsSection = event.sections ? `<p class="card-text event-info"><strong>Sections:</strong> ${event.sections}</p>` : '';
        let entryFeeSection = event.entry_fee ? `<p class="card-text event-info"><strong>Entry Fee:</strong> ${event.entry_fee}</p>` : '';
        let timeControlSection = event.time_control ? `<p class="card-text event-info"><strong>Time Control:</strong> ${event.time_control}</p>` : '';
        let formatSection = event.format ? `<p class="card-text event-info"><strong>Format:</strong> ${event.format}</p>` : '';
        let roundTimesSection = event.round_times ? `<p class="card-text event-info"><strong>Round Times:</strong> ${event.round_times}</p>` : '';
        let prizesSection = event.prizes ? `<p class="card-text event-info"><strong>Prizes:</strong> ${event.prizes}</p>` : '';
        let ageSection = event.ages ? `<p class="card-text event-info"><strong>Age Range:</strong> ${event.ages}</p>` : '';
        
        // Only show View Details link if there's no promo code
        let linkSection = '';
        if (event.link && !event.promo_code) {
            linkSection = `<a href="${event.link}" target="_blank" class="btn btn-primary btn-custom organizer-link" onclick="event.stopPropagation();">View Details</a>`;
        }
        
        // Add registration button with promo code if available
        let registrationSection = '';
        let promoBadge = ''; // Changed from promoRibbon to promoBadge
        if (event.promo_code) {
            const registrationUrl = event.registration_link || event.link || '#';
            registrationSection = `
                <div class="mt-3">
                    <a href="${registrationUrl}" target="_blank" class="btn btn-success btn-custom register-button" onclick="event.stopPropagation();">
                        <i class="fas fa-ticket-alt mr-2"></i>Register with 10% discount: <strong>${event.promo_code}</strong>
                    </a>
                </div>
            `;
            
            // Add horizontal promo badge instead of diagonal ribbon
            promoBadge = `<div class="promo-badge">10% DISCOUNT</div>`;
        }

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
            <div class="card event-card h-100 ${isEventPast ? 'bg-light text-dark' : cardThemeClass} ${hasPromo ? 'promo-card' : ''}">
            <div class="position-relative">
                ${promoBadge}
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

    /**
     * Creates filter buttons for each organizer
     */
    function createOrganizerFilters(organizers) {
        const organizerContainer = document.getElementById('organizer-filters');
        if (!organizerContainer) return;
        
        // Clear existing filters
        organizerContainer.innerHTML = '';
        
        // Create a filter state object to manage the filter state separately from UI
        window.filterState = {
            timeFilter: 'upcoming', // Default to upcoming
            organizerFilters: new Set(['all']), // Default to all organizers
            
            // Method to check if an event meets the filter criteria
            meetsFilterCriteria: function(event) {
                const isPast = event.classList.contains('past-event');
                const organizerElement = event.querySelector('.card-title');
                const organizer = organizerElement ? organizerElement.textContent.trim() : '';
                
                // Time filter check
                const meetsTimeFilter = 
                    (this.timeFilter === 'upcoming' && !isPast) || 
                    (this.timeFilter === 'past' && isPast);
                
                // Organizer filter check
                const meetsOrganizerFilter = 
                    this.organizerFilters.has('all') || 
                    this.organizerFilters.has(organizer);
                
                return meetsTimeFilter && meetsOrganizerFilter;
            },
            
            // Method to update the UI based on current filter state
            updateUI: function() {
                // Update time filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    const filterValue = btn.getAttribute('data-filter');
                    btn.classList.toggle('active', filterValue === this.timeFilter);
                });
                
                // Update organizer filter buttons
                document.querySelectorAll('.organizer-btn').forEach(btn => {
                    const organizerValue = btn.getAttribute('data-organizer');
                    btn.classList.toggle('active', this.organizerFilters.has(organizerValue));
                });
                
                // Apply the filters to the events
                applyCurrentFilters();
                
                // Dispatch custom event for ad injector to detect
                const filterEvent = new CustomEvent('filterStateChanged', {
                    detail: {
                        timeFilter: this.timeFilter,
                        organizerFilters: Array.from(this.organizerFilters)
                    }
                });
                document.dispatchEvent(filterEvent);
            },
            
            // Method to set a time filter
            setTimeFilter: function(filter) {
                this.timeFilter = filter;
                this.updateUI();
            },
            
            // Method to toggle an organizer filter
            toggleOrganizerFilter: function(organizer) {
                if (organizer === 'all') {
                    // When clicking "All", clear other selections
                    this.organizerFilters.clear();
                    this.organizerFilters.add('all');
                } else {
                    // When clicking a specific organizer
                    if (this.organizerFilters.has(organizer)) {
                        // If already selected, unselect it
                        this.organizerFilters.delete(organizer);
                        
                        // If no organizers are left selected, reactivate "All"
                        if (this.organizerFilters.size === 0 || 
                            (this.organizerFilters.size === 1 && this.organizerFilters.has('all'))) {
                            this.organizerFilters.clear();
                            this.organizerFilters.add('all');
                        }
                    } else {
                        // If not selected, add it and remove "All" if present
                        this.organizerFilters.add(organizer);
                        this.organizerFilters.delete('all');
                    }
                }
                
                // Update the UI to reflect the new state
                this.updateUI();
            },
            
            // Reset all filters to default state
            resetFilters: function() {
                this.timeFilter = 'upcoming';
                this.organizerFilters.clear();
                this.organizerFilters.add('all');
                this.updateUI();
            }
        };
        
        // Add "All Organizers" button
        const allButton = document.createElement('button');
        allButton.className = 'organizer-btn active';
        allButton.setAttribute('data-organizer', 'all');
        allButton.textContent = 'All Organizers';
        organizerContainer.appendChild(allButton);
        
        // Add button for each organizer
        organizers.forEach(organizer => {
            const button = document.createElement('button');
            button.className = 'organizer-btn';
            button.setAttribute('data-organizer', organizer);
            button.textContent = shortenOrganizerName(organizer);
            organizerContainer.appendChild(button);
        });
        
        // Add event listeners for time filter buttons using the state manager
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                window.filterState.setTimeFilter(filterValue);
            });
        });
        
        // Add event listeners for organizer filter buttons using the state manager
        document.querySelectorAll('.organizer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const organizerValue = this.getAttribute('data-organizer');
                window.filterState.toggleOrganizerFilter(organizerValue);
            });
        });
        
        // Initialize filters with default state
        window.filterState.resetFilters();
    }

    /**
     * Shortens long organizer names for better display in filter buttons
     */
    function shortenOrganizerName(name) {
        if (name.includes('Association with OSCA')) {
            return 'OSCA Affiliated';
        } else if (name.includes('Ocean State Chess Association')) {
            return 'OSCA';
        } else if (name.includes('Connecticut State Chess Association')) {
            return 'CSCA';
        } else if (name.includes('Continental Chess Association')) {
            return 'CCA';
        } else if (name.includes('Plainville Chess Club')) {
            return 'Plainville CC';
        }
        return name;
    }
    
    /**
     * Apply the current filters and update the event display
     */
    function applyCurrentFilters() {
        if (!window.filterState) return;
        
        const events = document.querySelectorAll('.event-item');
        let visibleCount = 0;
        
        console.log(`Applying filters - Time: ${window.filterState.timeFilter}, Organizers: ${Array.from(window.filterState.organizerFilters).join(', ')}`);
        
        // Collect events that meet filter criteria
        const visibleUpcomingEvents = [];
        const visiblePastEvents = [];
        
        events.forEach(event => {
            // Skip ad items from the filtering logic
            if (event.classList.contains('ad-item')) return;
            
            // Check if the event meets the current filter criteria
            if (window.filterState.meetsFilterCriteria(event)) {
                if (event.classList.contains('past-event')) {
                    visiblePastEvents.push(event);
                } else {
                    visibleUpcomingEvents.push(event);
                }
                visibleCount++;
            } else {
                // Hide events that don't meet criteria
                event.style.animation = 'fadeOut 0.2s ease-out forwards';
                setTimeout(() => {
                    event.style.display = 'none';
                }, 200);
            }
        });
        
        // Sort upcoming events chronologically (earliest first)
        visibleUpcomingEvents.sort((a, b) => {
            const dateA = new Date(a.querySelector('.event-date').textContent);
            const dateB = new Date(b.querySelector('.event-date').textContent);
            return dateA - dateB;
        });
        
        // Sort past events reverse chronologically (newest first)
        visiblePastEvents.sort((a, b) => {
            const dateA = new Date(a.querySelector('.event-date').textContent);
            const dateB = new Date(b.querySelector('.event-date').textContent);
            return dateB - dateA;
        });
        
        // Display all visible events with proper animation
        [...visibleUpcomingEvents, ...visiblePastEvents].forEach((event, index) => {
            event.style.display = 'block';
            event.style.animation = `fadeIn 0.3s ease-out ${index * 0.05}s forwards`;
        });
        
        // Don't hide ads - they should always be visible
        document.querySelectorAll('.event-item.ad-item').forEach(ad => {
            ad.style.display = 'block';
        });
        
        // Show/hide no events message
        const noEventsMessage = document.getElementById('no-events-message');
        if (noEventsMessage) {
            if (visibleCount === 0) {
                noEventsMessage.style.display = 'block';
                noEventsMessage.style.animation = 'fadeIn 0.5s ease-out forwards';
            } else {
                noEventsMessage.style.display = 'none';
            }
        }
        
        console.log(`Filter applied - showing ${visibleCount} events`);
        
        // After filters are applied, notify the ad injector if available
        setTimeout(() => {
            if (window.adInjector && window.adInjector.refreshAds) {
                window.adInjector.refreshAds();
            }
        }, 400);
    }

    // Add global handler to fix link clicking issues
    document.body.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            e.stopPropagation();
        }
    }, true);

    // Run initial filtering when events are loaded
    setTimeout(() => {
        // Check if events are loaded and apply initial filter
        if (document.querySelectorAll('.event-item').length > 0) {
            applyMatrixFilters();
        }
    }, 1000); // Give time for events to load

    // Initialize events to show only upcoming
    initializeEvents();
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

// Override or modify existing filter function if it exists
function filterEvents(filterType) {
    // This function may no longer be needed or can be simplified if it exists
    // ...existing code...
}