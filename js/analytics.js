// Basic analytics and cookie enforcement

// Check cookie consent status on page load
document.addEventListener('DOMContentLoaded', function() {
    const cookieConsent = localStorage.getItem('cookieConsent');
    
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
    
    // Here you could initialize your actual analytics code
    console.log('Analytics initialized');
    
    // Example of how you might initialize Google Analytics
    // if (typeof gtag === 'function') {
    //    gtag('consent', 'update', {
    //        'analytics_storage': 'granted'
    //    });
    // }
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