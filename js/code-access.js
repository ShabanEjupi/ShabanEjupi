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