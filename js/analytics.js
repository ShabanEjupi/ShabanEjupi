// Basic analytics and cookie enforcement

// Enforce cookie acceptance after inactivity period
document.addEventListener('DOMContentLoaded', function() {
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    // Only apply to users who haven't made a choice yet
    if (cookieConsent === null) {
        // Set a timeout to show the blocker after 30 seconds of inactivity
        let inactivityTimer = setTimeout(function() {
            if (localStorage.getItem('cookieConsent') === null) {
                document.getElementById('cookieConsent').classList.remove('visible');
                document.getElementById('cookieBlocker').classList.add('visible');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        }, 30000); // 30 seconds
        
        // Reset timer on user activity
        const resetTimer = function() {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(function() {
                if (localStorage.getItem('cookieConsent') === null) {
                    document.getElementById('cookieConsent').classList.remove('visible');
                    document.getElementById('cookieBlocker').classList.add('visible');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                }
            }, 30000);
        };
        
        // Monitor user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(function(event) {
            document.addEventListener(event, resetTimer, { passive: true });
        });
    }
    
    // If cookies were explicitly declined, block interaction
    if (cookieConsent === 'declined') {
        // Show the blocking overlay
        document.getElementById('cookieBlocker').classList.add('visible');
        
        // Prevent scrolling on the body
        document.body.style.overflow = 'hidden';
    }
});

// When cookies are accepted, allow scrolling again
document.addEventListener('cookiesAccepted', function() {
    document.body.style.overflow = 'auto';
});

// Google Analytics 4 (GA4) setup
document.addEventListener('cookiesAccepted', function() {
    // Load the Google Analytics 4 tag
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-Y6VMMDVTKY';
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Y6VMMDVTKY');
    
    // Track internal navigation on SPA
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && 
            e.target.getAttribute('href').startsWith('#')) {
            const sectionId = e.target.getAttribute('href').substring(1);
            gtag('event', 'navigation', {
                'event_category': 'Internal Link',
                'event_label': sectionId
            });
        }
    });
    
    console.log('Analytics initialized with GA4');
});

// Simple analytics system that respects privacy
const analytics = {
    events: [],
    sessionStart: new Date(),
    
    init: function() {
        // Set up event listeners for buttons we want to track
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.textContent.trim();
                const category = this.closest('section').id || 'unknown';
                analytics.trackEvent('button_click', { category, action });
                
                // Also send to GA4
                if (typeof gtag === 'function') {
                    gtag('event', 'button_click', {
                        'event_category': category,
                        'event_label': action
                    });
                }
            });
        });
        
        // Track page views
        this.trackEvent('page_view', { 
            page: window.location.pathname,
            referrer: document.referrer || 'direct'
        });
        
        // Send data when user leaves
        window.addEventListener('beforeunload', () => {
            this.sendData();
        });
        
        // Send data every 5 minutes if user stays on site
        setInterval(() => this.sendData(), 5 * 60 * 1000);
    },
    
    trackEvent: function(eventName, eventData = {}) {
        const event = {
            eventName,
            timestamp: new Date().toISOString(),
            sessionDuration: (new Date() - this.sessionStart) / 1000,
            ...eventData
        };
        
        this.events.push(event);
        console.log('Event tracked:', event);
        
        // If we have many events, send them
        if (this.events.length >= 10) {
            this.sendData();
        }
    },
    
    sendData: function() {
        if (this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        fetch('/.netlify/functions/track-analytics', {
            method: 'POST',
            body: JSON.stringify({ events: eventsToSend }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => console.log('Analytics sent:', data))
        .catch(error => console.error('Analytics error:', error));
    }
};

// Initialize analytics after user accepts cookies
document.addEventListener('cookiesAccepted', analytics.init.bind(analytics));