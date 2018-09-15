var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
  host: 'onedistin.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS
  }
});

var throwMail = function(to,subject,html){
  const mailOptions = {
  from: process.env.NODEMAILER_EMAIL, // sender address
  to: to, // list of receivers
  subject: subject, // Subject line
  html: html// plain text body
  };

  transporter.sendMail(mailOptions, function(err, info){
    if(err)
      console.log(err);
    else {
      console.log(info);
    }
  });
}

module.exports = {
  throwMail: throwMail
}
