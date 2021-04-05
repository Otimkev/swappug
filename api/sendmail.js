const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

const sendMail = (email, subject, text, cb) => {
    const mailOptions = {
        from: 'no-reply@tevfik1.com', // TODO replace this with your own email
        to: email, // TODO: the receiver email has to be authorized for the free tier
        subject,
        text
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            return cb(err, null);
        }
        return cb(null, data);
    });
}

module.exports = sendMail;