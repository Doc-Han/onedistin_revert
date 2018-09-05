var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS
  }
});

function throwMail(to,subject,html){
  const mailOptions = {
  from: 'The Developer of Onedistin', // sender address
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

module.exports = throwMail;
