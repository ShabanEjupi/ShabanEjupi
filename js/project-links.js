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
        // Set subject based on request type
        subjectField.value = isCodeRequest 
            ? `Code Access Request for ${projectTitle}`
            : `Project Demo Request for ${projectTitle}`;
        
        // Set message based on request type
        let message = `Hello Shaban,\n\n`;
        
        if (isCodeRequest) {
            message += `I'm interested in your ${projectTitle} project and would like to request access to the source code. Could you please provide more information about the project and any requirements for accessing the code?\n\n`;
        } else {
            message += `I'm interested in your ${projectTitle} project and would like to request access to see a demo or live version. Could you please provide me with access or more details about this project?\n\n`;
        }
        
        message += `Thank you,\n`;
        messageField.value = message;
        
        // Focus the name field
        document.getElementById('name').focus();
    }
    
    // Show notification to the user
    const actionType = isCodeRequest ? "code access" : "project demo";
    showNotification('info', `Please complete the form to request ${actionType} for ${projectTitle}.`);
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