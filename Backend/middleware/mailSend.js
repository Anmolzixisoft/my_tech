var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "tls://smtp.gmail.com",
    service: 'gmail',
    port: 587,
    auth: {
        user: 'anmolrajputzixisoft@gmail.com',
        pass: 'drqy nyew vhaw zvxx',
    }
});

function generateOTP() {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }

    return otp;
}
function sendVerificationMail(to, pathname, text) {
    console.log("to", to);
    //   console.log("url",url);
    const otp = generateOTP();
    console.log(otp, 'otp');
    const mailOptions = {
        from: 'anmolrajputzixisoft@gmail.com',
        to: to,
        subject: "SignUp OTP",
        text: ` OTP code is: ${otp}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('------------------', error);
        } else {
            console.log('Email sent: ');
        }
    })
}
module.exports = sendVerificationMail