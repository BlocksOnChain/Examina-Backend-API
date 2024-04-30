var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",  
    secure: true,
    tls: {
        ciphers:'SSLv3'
    },
    requireTLS:true,
    port: 465,
    debug: true,
	auth: {
		user: 'info@choz.io',
		pass: `${process.env.MAIL_PASSWORD}`,
	},
    secureConnection: false,
});

module.exports = transporter;