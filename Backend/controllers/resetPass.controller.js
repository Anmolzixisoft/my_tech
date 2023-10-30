const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../database/mysqldb')
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

function verifyByOtp(req, res) {
    try {
        const { email, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ error: 'Missing required fields', status: false });
        }

        connection.query(
            'SELECT *  FROM landsharein_db.tbl_user WHERE otp = ? ',
            [otp],
            (err, results) => {

                if (err) {
                    console.error('Database query failed: ' + err);
                    return res.send({ error: 'Internal server error', status: false });
                }

                if (results.length == 0) {
                    return res.send({ error: 'Otp Not Match', status: false });
                }

                if (results[0].otp != otp) {
                    return res.send({ error: 'Otp Not Match', status: false });
                }


                const user = results[0];

                const token = jwt.sign({ userId: user.id, email: user.email }, 'secret_key', {
                    expiresIn: '10h',
                });
                const userId = user.id


                res.send({ msg: "Otp Verify successfully", token: token, userId: userId });


            }
        );
    }
    catch (error) {
        console.log(error);
        return res.send({ data: error, status: false })
    }
}

function resetPass(req, res) {
    const { email, newPassword } = req.body;

    // Check if the request body is missing fields
    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields', status: false });
    }

    // Hash the new password

    connection.query('select * from landsharein_db.tbl_user where email= "' + email + '" ', (err, results) => {
        if (results.length > 0) {

            bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Password hashing failed: ' + hashErr);
                    return res.status(500).json({ error: 'Internal server error', status: false });
                }

                connection.query(
                    'UPDATE landsharein_db.tbl_user SET password = ? WHERE email = ?',
                    [hashedPassword, email],
                    (updateErr, updateResult) => {
                        if (updateErr) {
                            console.error('Error updating password: ' + updateErr);
                            return res.status(500).json({ error: 'Error updating password', status: false });
                        }

                        if (updateResult.affectedRows === 0) {
                            // If no rows were affected, the user with the provided email does not exist
                            return res.status(404).json({ error: 'User not found', status: false });
                        }

                        console.log('Password reset successfully.');
                        return res.status(200).json({ status: true, msg: 'Password Change successfully' });
                    }
                );
            });
        }
        else {
            return res.send({ message: "email not register" })
        }
    })

}

module.exports = { resetPass, verifyByOtp }