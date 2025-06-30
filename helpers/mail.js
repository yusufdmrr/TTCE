const nodemailer = require('nodemailer');

async function sendEmail(receiverEmail, subject, username, password, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "temizlikpro00@gmail.com",
        pass: "govr xyna emug izqm",
      },
    });

    const mailOptions = {
      from: 'temizlikpro00@gmail.com',
      to: receiverEmail,
      subject: subject || "E-Ticaret Platformuna Hoş Geldiniz!",
      text: "Hesabınız oluşturuldu.",
      html: html || `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <title>Hoş Geldiniz</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px; }
            .content p { margin: 10px 0; font-size: 15px; color: #333; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 E-Ticaret Platformuna Hoş Geldiniz!</h1>
            </div>
            <div class="content">
              <p>Merhaba <strong>${username}</strong>,</p>
              <p>Hesabınız başarıyla oluşturulmuştur.</p>
              <p><strong>Giriş E-Postanız:</strong> ${receiverEmail}</p>
              <p><strong>Şifreniz:</strong> ${password}</p>
              <p>Lütfen hesabınızı güvenliğiniz için giriş yaptıktan sonra şifrenizi değiştirin.</p>
              <p>Keyifli alışverişler dileriz! 🛍️</p>
            </div>
            <div class="footer">
              Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', info.response);
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
}

module.exports = { sendEmail };
