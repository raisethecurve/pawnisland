// Coaching page functionality
class CoachingPage {
    constructor() {
        this.initScrolling();
        this.initSectionHighlight();
        this.handleThemeChanges();
    }

    initScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initSectionHighlight() {
        const sections = document.querySelectorAll('.coaching-section');
        const navItems = document.querySelectorAll('.coaching-nav-item');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });

            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href').slice(1) === current) {
                    item.classList.add('active');
                }
            });
        });
    }

    handleThemeChanges() {
        // Listen for theme changes from ThemeManager
        document.addEventListener('themeChanged', (e) => {
            const theme = e.detail.theme;
            const isDark = theme === 'night-theme';
            
            this.updateCoachingElementsForTheme(theme);
        });
    }

    updateCoachingElementsForTheme(theme) {
        const isNightTheme = theme === 'night-theme';
        
        // Update service cards
        document.querySelectorAll('.service-card').forEach(card => {
            if (isNightTheme) {
                card.style.backgroundColor = '#2c2f33';
                card.style.color = '#f8f9fa';
            } else {
                card.style.backgroundColor = '#ffffff';
                card.style.color = '#333333';
            }
        });
        
        // Update service text
        document.querySelectorAll('.service-text').forEach(text => {
            if (isNightTheme) {
                text.style.color = '#e4e4e4';
            } else {
                text.style.color = '#333333';
            }
        });
        
        // Update section titles and subtitles
        document.querySelectorAll('.section-title').forEach(title => {
            if (isNightTheme) {
                title.style.color = '#f8f9fa';
            } else {
                title.style.color = '#343a40';
            }
        });
        
        document.querySelectorAll('.section-subtitle').forEach(subtitle => {
            if (isNightTheme) {
                subtitle.style.color = '#adb5bd';
            } else {
                subtitle.style.color = '#6c757d';
            }
        });
        
        // Update coaching sections background
        document.querySelectorAll('.coaching-section').forEach(section => {
            if (isNightTheme) {
                section.style.setProperty('--coaching-bg-color', 'rgba(33, 37, 41, 0.7)');
            } else {
                section.style.setProperty('--coaching-bg-color', '#f8f9fa');
            }
        });
        
        // Update description box
        document.querySelectorAll('.description-box').forEach(box => {
            if (isNightTheme) {
                box.style.backgroundColor = '#212529';
            } else {
                box.style.backgroundColor = '#343a40';
            }
        });
        
        // Update coaching nav items
        document.querySelectorAll('.coaching-nav-item').forEach(item => {
            if (isNightTheme) {
                item.style.backgroundColor = '#212529';
            } else {
                item.style.backgroundColor = '#343a40';
            }
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new CoachingPage();
});
