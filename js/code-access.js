document.addEventListener('DOMContentLoaded', function() {
    // Protect project links based on cookie consent
    protectCodeLinks();
    
    // Listen for cookie acceptance events
    document.addEventListener('cookiesAccepted', function() {
        // Only then unlock the actual demo links (not code links)
        unlockDemoLinks();
    });
});

function protectCodeLinks() {
    // Get all code links
    const codeLinks = document.querySelectorAll('.project-links a[data-i18n="projects.cta.code"]');
    
    codeLinks.forEach(link => {
        // Store the original href
        const originalHref = link.getAttribute('href');
        link.dataset.originalHref = originalHref;
        
        // Replace href with JavaScript handler
        link.setAttribute('href', '#contact');
    });
}

function unlockDemoLinks() {
    // Enable demo links for specific allowed projects
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const title = card.querySelector('.project-title').textContent;
        const demoLink = card.querySelector('.project-links a:not([data-i18n="projects.cta.code"])');
        
        // Only enable these specific demo projects
        if (title.includes('KoreaDrive') || 
            title.includes('Violeta Hasani') || 
            title.includes('AI Image Generation') || 
            title.includes('AI Chatbot') || 
            title.includes('EtinUP') ||
            title.includes('Enisi Center')) {
            
            // These links remain functional
        } else {
            // Restricted demos redirect to contact
            if (demoLink) {
                demoLink.setAttribute('href', '#contact');
            }
        }
    });
}

function handleCodeButtonClick(projectTitle) {
    // Pre-fill contact form with code request
    const subjectField = document.getElementById('subject');
    const messageField = document.getElementById('message');
    
    if (subjectField && messageField) {
        subjectField.value = `Code Request: ${projectTitle}`;
        messageField.value = `Hello Shaban,\n\nI'm interested in viewing the code for your "${projectTitle}" project. Could you please share access with me?\n\nThank you.`;
        
        // Record analytics event
        trackEvent('code_request', {
            project: projectTitle,
            timestamp: new Date().toISOString()
        });
        
        // Scroll to contact form
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Show notification to user
    showNotification('info', 'Please complete the contact form to request code access.');
}