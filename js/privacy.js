document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already made a cookie choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (cookieConsent === null) {
        // Show cookie banner after 2 seconds
        setTimeout(() => {
            document.getElementById('cookieConsent').classList.add('visible');
        }, 2000);
        
        // Add scroll detection to enforce cookie choice
        let scrollHandled = false;
        window.addEventListener('scroll', function() {
            // Only trigger once and only if user hasn't made a choice yet
            if (!scrollHandled && localStorage.getItem('cookieConsent') === null) {
                // After user has scrolled a bit (200px), show the blocker
                if (window.scrollY > 200) {
                    document.getElementById('cookieConsent').classList.remove('visible');
                    document.getElementById('cookieBlocker').classList.add('visible');
                    document.body.style.overflow = 'hidden'; // Prevent further scrolling
                    scrollHandled = true;
                }
            }
        }, { passive: true });
        
    } else if (cookieConsent === 'accepted') {
        // Initialize analytics if cookies were previously accepted
        const event = new Event('cookiesAccepted');
        document.dispatchEvent(event);
    } else if (cookieConsent === 'declined') {
        // Show blocking overlay if cookies were previously declined
        document.getElementById('cookieBlocker').classList.add('visible');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Handle accept button
    document.getElementById('acceptCookies').addEventListener('click', function() {
        acceptCookiesHandler();
    });
    
    // Handle decline button
    document.getElementById('declineCookies').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'declined');
        document.getElementById('cookieConsent').classList.remove('visible');
        document.getElementById('cookieBlocker').classList.add('visible');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        showNotification('info', 'You have declined cookies. Website access is restricted.');
    });
    
    // Handle reconsider button (from the blocking overlay)
    document.getElementById('reconsiderCookies').addEventListener('click', function() {
        acceptCookiesHandler();
        document.getElementById('cookieBlocker').classList.remove('visible');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    });
    
    // Handle privacy policy modal
    document.getElementById('openPrivacyPolicy').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('privacyModal').style.display = 'block';
        
        // Update all translations in the privacy modal when opened
        document.querySelectorAll('#privacyModal [data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLanguage][key]) {
                element.textContent = translations[currentLanguage][key];
            }
        });
    });
    
    // Close privacy policy modal (X button)
    document.querySelector('.close-modal').addEventListener('click', function() {
        closePrivacyPolicyHandler();
    });
    
    // Close policy with the button
    document.getElementById('closePrivacyPolicy').addEventListener('click', function() {
        closePrivacyPolicyHandler();
    });
    
    // Close modal when clicking outside content
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('privacyModal');
        if (event.target === modal) {
            closePrivacyPolicyHandler();
        }
    });
    
    // Function to handle cookie acceptance
    function acceptCookiesHandler() {
        localStorage.setItem('cookieConsent', 'accepted');
        document.getElementById('cookieConsent').classList.remove('visible');
        document.getElementById('cookieBlocker').classList.remove('visible');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        
        // Trigger analytics initialization
        const event = new Event('cookiesAccepted');
        document.dispatchEvent(event);
        
        showNotification('success', 'Thank you for accepting cookies!');
    }
    
    // Function to handle privacy policy closing
    function closePrivacyPolicyHandler() {
        document.getElementById('privacyModal').style.display = 'none';
        
        // Check if cookies haven't been accepted yet
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (cookieConsent !== 'accepted') {
            // Show the cookie blocker
            document.getElementById('cookieBlocker').classList.add('visible');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }
});

// Update cookie consent text when language changes
document.addEventListener('languageChanged', function() {
    // Update all translations in the cookie banner and blocker
    document.querySelectorAll('#cookieConsent [data-i18n], #cookieBlocker [data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
});

// Helper function to show notifications
function showNotification(type, message) {
    // Create notification element if it doesn't exist
    if (window.showNotification) {
        // Use the existing global function
        window.showNotification(type, message);
    } else {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle'}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('notification-visible');
        }, 10);
    }
});

document.addEventListener('cookiesAccepted', function() {
    // Only detect location after cookies are accepted, and only if no language preference exists
    if (!localStorage.getItem('languageManuallySet') && !localStorage.getItem('languageDetected')) {
        detectUserLocation();
        localStorage.setItem('languageDetected', 'true');
    }
});