document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already made a cookie choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (cookieConsent === null) {
        // Show cookie banner after 2 seconds
        setTimeout(() => {
            document.getElementById('cookieConsent').classList.add('visible');
        }, 2000);
    } else if (cookieConsent === 'accepted') {
        // Initialize analytics if cookies were previously accepted
        const event = new Event('cookiesAccepted');
        document.dispatchEvent(event);
    } else if (cookieConsent === 'declined') {
        // Show blocking overlay if cookies were previously declined
        document.getElementById('cookieBlocker').classList.add('visible');
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
        
        showNotification('info', 'You have declined cookies. Website access is restricted.');
    });
    
    // Handle reconsider button (from the blocking overlay)
    document.getElementById('reconsiderCookies').addEventListener('click', function() {
        acceptCookiesHandler();
        document.getElementById('cookieBlocker').classList.remove('visible');
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
        // Create a simple alert if the function doesn't exist
        alert(message);
    }
}