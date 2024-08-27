const nodemailer = require('nodemailer');
//const { htmlToText } = require('html-to-text');
const pug = require('pug');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.userId = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phone = user.phone;
    this.url = url;
    this.message = user.message;
    this.emailuser = user.emailuser;
    this.name = user.name;
    this.type = user.type;
    this.from = '"Chowjung" <noreply@chowjung.com>';
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   return nodemailer.createTransport({
    //     // service: 'gmail',
    //     // auth: {
    //     //   user: process.env.GMAIL_USERNAME,
    //     //   pass: process.env.GMAIL_PASSWORD,
    //     // },
    //     host: 'smtp.mailgun.org',
    //     port: 9999,
    //     auth: {
    //       user: 'test@testmail.com',
    //       pass: pass,
    //     },
    //     tls: {
    //       // do not fail on invalid certs
    //       rejectUnauthorized: false,
    //     },
    //   });
    // }

    return nodemailer.createTransport({
      host: 'mail.fn.digisolution.co.th',
      port: 587,
      auth: {
        user: 'noreply@fn.digisolution.co.th',
        pass: 'Wmc12345',
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    //console.log(__dirname);
    const html = pug.renderFile(
      `./email/${template}.pug`,
      {
        userId: this.userId,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.to,
        phone: this.phone,
        url: this.url,
        message: this.message,
        emailuser: this.emailuser,
        name: this.name,
        type: this.type,
      }
    );

    //const html = 'email';
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      //text: htmlToText(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'การสมัครสมาชิกของท่านเสร็จสิ้น | Chowjung - โชว์จุ่งลูกหมาก');
  }

  async sendPasswordReset() {
    await this.send('resetpass','รีเซ็ตรหัสผ่านผู้ใช้งานของท่าน | Chowjung - โชว์จุ่งลูกหมาก');
  }

  async approveUser() {
    await this.send('approve','บัญชีของท่านได้รับการอนุมัติแล้ว | Chowjung - โชว์จุ่งลูกหมาก');
  }
  
  async rejectUser() {
    await this.send('reject','บัญชีของท่านไม่ผ่านการอนุมัติ | Chowjung - โชว์จุ่งลูกหมาก');
  }  
  
  async sendMessageToUs() {
    await this.send('sendMessageToUs','ส่งข้อความถึงเรา');
  }  
};
