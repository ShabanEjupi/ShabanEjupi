const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing environment variables: EMAIL_USER or EMAIL_PASS');
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Server configuration error. Please contact the administrator.'
      })
    };
  }

  try {
    const { email } = JSON.parse(event.body);
    console.log(`Processing subscription from: ${email}`);
    
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Test SMTP connection
    await transporter.verify().catch(error => {
      console.error('SMTP verification failed:', error);
      throw new Error('Email service connection failed');
    });
    
    // Prepare email content
    const mailOptions = {
      from: `"Portfolio Newsletter" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Your email
      subject: 'New Portfolio Newsletter Subscription',
      html: `
        <h3>New Newsletter Subscription</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `
    };
    
    // Send notification email to yourself
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    // Send confirmation email to subscriber
    const confirmationMail = {
      from: `"Shaban Ejupi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for subscribing to my newsletter',
      html: `
        <h3>Thank you for subscribing!</h3>
        <p>Dear Subscriber,</p>
        <p>Thank you for subscribing to my newsletter. You'll now receive updates about my latest projects, blog posts, and events in software development.</p>
        <p>I typically send newsletters once a month, featuring:</p>
        <ul>
          <li>New portfolio projects</li>
          <li>Technical articles and tutorials</li>
          <li>Industry insights and trends</li>
          <li>Upcoming tech events I'll be attending</li>
        </ul>
        <p>Feel free to reply to this email if you have any questions or would like to discuss potential collaboration opportunities.</p>
        <p>Best regards,<br>Shaban Ejupi<br>Software Developer & IT Professional</p>
      `
    };
    
    await transporter.sendMail(confirmationMail);
    console.log('Confirmation sent to:', email);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'You have successfully subscribed to my newsletter!' })
    };
  } catch (error) {
    console.error('Error processing subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Failed to subscribe. Please try again later.' })
    };
  }
};