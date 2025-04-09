const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { events } = JSON.parse(event.body);
        console.log(`Received ${events.length} events to track`);
        
        // Store events in database or file (simplified here)
        // In production, you would use a proper database
        
        // Send weekly report if it's been a week since last report
        const shouldSendReport = await shouldSendWeeklyReport();
        if (shouldSendReport) {
            await sendAnalyticsReport();
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Analytics received' })
        };
    } catch (error) {
        console.error('Error tracking analytics:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Error processing analytics' })
        };
    }
};

// Check if it's time to send weekly report
async function shouldSendWeeklyReport() {
    // Implementation would check when last report was sent
    // For simplicity, returning false here
    return false;
}

// Send analytics report via email
async function sendAnalyticsReport() {
    // Create summary of analytics data
    const reportData = await generateAnalyticsReport();
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: `"Portfolio Analytics" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: 'Weekly Portfolio Analytics Report',
        html: `
            <h2>Weekly Analytics Report</h2>
            <p>Here's a summary of activity on your portfolio site this week:</p>
            
            <h3>Page Views: ${reportData.pageViews}</h3>
            
            <h3>Button Clicks:</h3>
            <ul>
                ${reportData.buttonClicks.map(click => `
                    <li>${click.category}: ${click.action} - ${click.count} clicks</li>
                `).join('')}
            </ul>
            
            <h3>Code Requests:</h3>
            <ul>
                ${reportData.codeRequests.map(request => `
                    <li>${request.project}: ${request.count} requests</li>
                `).join('')}
            </ul>
            
            <p>View your full analytics dashboard for more details.</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Weekly analytics report sent');
    
    // Update last report sent timestamp
    // Implementation would store this in database
}

// Generate analytics report data
async function generateAnalyticsReport() {
    // In a real implementation, this would query your database
    // For demo purposes, returning sample data
    return {
        pageViews: 256,
        buttonClicks: [
            { category: 'projects', action: 'View Code', count: 45 },
            { category: 'contact', action: 'Send Message', count: 12 },
            { category: 'hero', action: 'View Projects', count: 78 }
        ],
        codeRequests: [
            { project: 'KoreaDrive KS', count: 8 },
            { project: 'AI Chatbot', count: 15 },
            { project: 'E-commerce website', count: 6 }
        ]
    };
}