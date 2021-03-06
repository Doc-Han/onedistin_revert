var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // TLS requires secureConnection to be false
  auth: {
    user: 'support@onedistin.com',
    pass: 'Newworldorder2'
  },
  requireTLS: true,
  tls: {
            ciphers: 'SSLv3'
        }
});

var throwMail = function(to,subject,html){
  const mailOptions = {
  from: "Onedistin <support@onedistin.com>", // sender address
  to: to, // list of receivers
  subject: subject, // Subject line
  html: html// plain text body
  };
  console.log(mailOptions);

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
