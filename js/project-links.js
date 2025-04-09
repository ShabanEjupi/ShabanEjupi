document.addEventListener('DOMContentLoaded', function() {
    // Set up link interception
    setupProjectLinks();
});

function setupProjectLinks() {
    // Get all project card links
    const projectLinks = document.querySelectorAll('.project-card .project-links a');
    
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const projectCard = this.closest('.project-card');
            const projectTitle = projectCard.querySelector('.project-title').textContent;
            const isCodeLink = this.textContent.toLowerCase().includes('code') || 
                              this.getAttribute('data-i18n')?.includes('code');
            const isVisitLink = !isCodeLink;
            
            // Projects that should redirect to contact form
            const restrictedProjects = [
                'Prizren Park App',
                'E-commerce website',
                'E-commerce',
            ];
            
            // Check if this is a code link or restricted project
            if (isCodeLink || restrictedProjects.some(name => projectTitle.includes(name))) {
                e.preventDefault();
                
                // Redirect to contact form with pre-filled message
                redirectToContactWithMessage(projectTitle, isCodeLink);
                return;
            }
            
            // Allowed external links can proceed normally (koreadriveks.netlify.app already has href)
            // For demo sites (AI Generator, Chatbot), we would normally add specific handling here
            // but for now we'll let them go to their hrefs as well
        });
    });
    
    // Add specific handlers for AI demo buttons if needed
    const aiGenButton = document.querySelector('[data-i18n="projects.cta.try"]');
    if (aiGenButton) {
        aiGenButton.addEventListener('click', function(e) {
            // If you have a real AI generation demo, this would navigate there
            // Otherwise, use the href already set on the button
        });
    }
    
    const chatbotButton = document.querySelector('[data-i18n="projects.cta.chat"]');
    if (chatbotButton) {
        chatbotButton.addEventListener('click', function(e) {
            // If you have a real chatbot demo, this would navigate there
            // Otherwise, use the href already set on the button
        });
    }
}

function redirectToContactWithMessage(projectTitle, isCodeRequest) {
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Set default subject and message
    const subjectField = document.getElementById('subject');
    const messageField = document.getElementById('message');
    
    if (subjectField && messageField) {
        // Set subject based on request type
        subjectField.value = isCodeRequest 
            ? `Code Request for ${projectTitle}`
            : `Project Access Request for ${projectTitle}`;
        
        // Set message based on request type
        let message = `Hello Shaban,\n\n`;
        
        if (isCodeRequest) {
            message += `I'm interested in your ${projectTitle} project and would like to request access to the source code. Could you please provide more information about the project and any requirements for accessing the code?\n\n`;
        } else {
            message += `I'm interested in your ${projectTitle} project and would like to request access to see it in action. Could you please provide me with a demo or more details about this project?\n\n`;
        }
        
        message += `Thank you,\n`;
        messageField.value = message;
        
        // Focus the name field
        document.getElementById('name').focus();
    }
    
    // Show notification to the user
    showNotification('info', `Please complete the form to request information about ${projectTitle}.`);
}