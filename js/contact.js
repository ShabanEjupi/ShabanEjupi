const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  console.log('Contact function triggered');
  
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
    const { name, email, subject, message } = JSON.parse(event.body);
    console.log(`Processing contact form submission from: ${email}`);
    
    // Configure transporter - Using direct SMTP configuration for better control
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Test SMTP connection
    console.log('Verifying SMTP connection...');
    await transporter.verify().catch(error => {
      console.error('SMTP verification failed:', error);
      throw new Error(`Email service connection failed: ${error.message}`);
    });
    
    console.log('SMTP connection verified successfully');
    
    // Prepare email content with more professional format
    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER, // Violeta's email
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };
    
    // Send email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // Send confirmation email to the sender with payment information for research
    console.log('Sending confirmation email...');
    const confirmationMail = {
      from: `"Violeta Hasani" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for your message',
      html: `
        <h3>Thank You for Your Interest!</h3>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in my research paper "Smuggling as a Criminal Offense with Special Focus on the Territory of the Basic Court of Mitrovica 2008-2011".</p>
        <p>The paper is available for purchase at a price of 50€.</p>
        <p>Please choose one of the following payment options:</p>
        <ul>
          <li>
            <strong>PayPal:</strong> Click <a href="paypal.me/shabanejupi5" target="_blank">here</a> to complete your payment.
          </li>
          <li>
            <strong>Bank Transfer:</strong> Bank transfer details will be provided shortly.
          </li>
        </ul>
        <p>After making your payment, please reply to this email with proof of payment so that I can send you the full research paper within 24 hours.</p>
        <p>If you have any questions, feel free to contact me at ${process.env.EMAIL_USER}.</p>
        <p>Best regards,<br>Violeta Hasani<br>Legal Researcher & Academic</p>
      `
    };
    
    await transporter.sendMail(confirmationMail);
    console.log('Confirmation email sent successfully');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Your message has been sent successfully!' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Failed to send email. Please try again later.',
        error: error.message // This helps with debugging but remove in production
      })
    };
  }
};