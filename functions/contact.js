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
    
    // Prepare email content with professional format
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER, // Your email
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    // Send email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // Send confirmation email to the sender
    console.log('Sending confirmation email...');
    const confirmationMail = {
      from: `"Shaban Ejupi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for your message',
      html: `
        <h3>Thank You for Contacting Me</h3>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out through my portfolio website. I have received your message and will get back to you as soon as possible.</p>
        <p>Here's a summary of your message:</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
        <p>If you need immediate assistance, feel free to call me at (+383) 45 601 379.</p>
        <p>Best regards,<br>Shaban Ejupi<br>Software Developer & IT Professional</p>
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
        message: 'Failed to send email. Please try again later.'
      })
    };
  }
};