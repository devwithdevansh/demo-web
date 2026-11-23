const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // For demonstration, we use Ethereal Email (a fake SMTP service for testing)
    // If you want to use Gmail or SendGrid, you would pass real credentials here.
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const mailOptions = {
      from: '"GlowUp Salon" <noreply@glowupsalon.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #c084fc; text-align: center;">GlowUp Salon</h2>
          <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            ${options.htmlMessage || `<p>${options.message}</p>`}
          </div>
          <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('Email could not be sent:', error.message);
  }
};

module.exports = sendEmail;
