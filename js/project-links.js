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
            
            // Projects that should redirect to contact form for code links
            const restrictedProjects = [
                'Prizren Park App',
                'E-commerce website',
                'E-commerce'
            ];
            
            // Check if this is a code link (for any project)
            if (isCodeLink) {
                e.preventDefault();
                redirectToContactWithMessage(projectTitle, true);
                return;
            }
            
            // Check if this is a visit link for a restricted project
            if (isVisitLink && restrictedProjects.some(name => projectTitle.includes(name))) {
                e.preventDefault();
                redirectToContactWithMessage(projectTitle, false);
                return;
            }
            
            // All other links proceed normally
        });
    });
}

function redirectToContactWithMessage(projectTitle, isCodeRequest) {
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Set default subject and message
    const subjectField = document.getElementById('subject');
    const messageField = document.getElementById('message');
    
    if (subjectField && messageField) {
        // Get current language
        const lang = currentLanguage || 'en';
        
        // Format translation key with project title
        const formatTranslation = (key, value) => {
            if (!translations[lang][key]) return value;
            return translations[lang][key].replace("{0}", projectTitle);
        };
        
        // Set subject based on request type
        if (isCodeRequest) {
            subjectField.value = formatTranslation('project.code.request.subject', `Code Access Request for ${projectTitle}`);
            messageField.value = formatTranslation('project.code.request.message', 
                `Hello Shaban,\n\nI'm interested in your ${projectTitle} project and would like to request access to the source code. Could you please provide more information about the project and any requirements for accessing the code?\n\nThank you,\n`);
        } else {
            subjectField.value = formatTranslation('project.demo.request.subject', `Project Demo Request for ${projectTitle}`);
            messageField.value = formatTranslation('project.demo.request.message', 
                `Hello Shaban,\n\nI'm interested in your ${projectTitle} project and would like to request access to see a demo or live version. Could you please provide me with access or more details about this project?\n\nThank you,\n`);
        }
        
        // Focus the name field
        document.getElementById('name').focus();
    }
    
    // Show notification to the user
    const notificationKey = isCodeRequest ? 'notification.code.access' : 'notification.demo.access';
    const defaultMessage = isCodeRequest 
        ? `Please complete the form to request code access for ${projectTitle}.`
        : `Please complete the form to request project demo for ${projectTitle}.`;
    
    showNotification('info', formatTranslation(notificationKey, defaultMessage));
}

// Helper function that should already exist in your main.js
// Including it here for reference in case it needs to be added
if (typeof showNotification !== 'function') {
    function showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
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
}

// Helper format function for translations
function formatTranslation(key, defaultText) {
    const lang = currentLanguage || 'en';
    if (!translations[lang][key]) return defaultText;
    return translations[lang][key].replace(/\{0\}/g, projectTitle);
}

// Add at the end of the file

// Update messages when language changes
document.addEventListener('languageChanged', function() {
    // If user is currently on the contact form with pre-filled data,
    // update the text based on what type of request they're making
    const subjectField = document.getElementById('subject');
    if (subjectField && subjectField.value) {
        // Detect what kind of request this is and update accordingly
        if (subjectField.value.includes('Code Access')) {
            // Extract project name
            const projectName = subjectField.value.replace('Code Access Request for ', '');
            redirectToContactWithMessage(projectName, true);
        } else if (subjectField.value.includes('Project Demo')) {
            const projectName = subjectField.value.replace('Project Demo Request for ', '');
            redirectToContactWithMessage(projectName, false);
        } else if (subjectField.value === 'CV Request') {
            requestCV();
        }
    }
});