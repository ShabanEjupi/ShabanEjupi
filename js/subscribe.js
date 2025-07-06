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
      from: `"Newsletter Subscription" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Violeta's email
      subject: 'New Newsletter Subscription',
      html: `
        <h3>New Newsletter Subscription</h3>
        <p><strong>Email:</strong> ${email}</p>
      `
    };
    
    // Send notification email to Violeta
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    // Send confirmation email to subscriber
    const confirmationMail = {
      from: `"Violeta Hasani" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Subscription Confirmation',
      html: `
        <h3>Thank you for subscribing!</h3>
        <p>Dear Subscriber,</p>
        <p>Thank you for subscribing to my newsletter. You will now receive updates about my latest research and publications in criminal law with a focus on smuggling offenses.</p>
        <p>If you're interested in my research paper "Smuggling as a Criminal Offense with Special Focus on the Territory of the Basic Court of Mitrovica 2008-2011", it is available for purchase at a price of 50€. Please contact me for more information.</p>
        <p>Best regards,<br>Violeta Hasani<br>Legal Researcher & Academic</p>
      `
    };
    
    await transporter.sendMail(confirmationMail);
    console.log('Confirmation sent to:', email);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'You have successfully subscribed!' })
    };
  } catch (error) {
    console.error('Error processing subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `Failed to subscribe: ${error.message}` })
    };
  }
};