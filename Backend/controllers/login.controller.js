const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const connection = require('../database/mysqldb')
var nodemailer = require('nodemailer');
const accountSid = "ACcc7b1e66b119f2e345827ff445c77620";
const authToken = "bf4b97b8b0045649124531ec335ff854";
const client = require("twilio")(accountSid, authToken);
const axios = require('axios')
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
        const { id, otp } = req.body;
        if (id === '') {
            return res.status(200).json({ error: true, message: "Please provide the id", data: null })
        }
        if (otp === '') {
            return res.status(200).json({ error: true, message: "Please provide the otp", data: null })
        } else {
            connection.query(
                'SELECT *  FROM my_tech.users_tbl WHERE id = ? AND otp = ? ',
                [id, otp],
                (err, results) => {
                    if (err) {
                        console.error('Database query failed: ' + err);
                        return res.send({ error: 'Internal server error', status: false });
                    }
                    if (results.length == 0) {
                        return res.send({ error: 'Otp Not found', status: false });
                    } else {
                        const user = results[0];
                        res.send({ status: true, msg: "Otp Verify successfully", data: user });
                    }



                });
        }
    }
    catch (error) {
        return res.send({ data: error, status: false })
    }
}



function setPass(req, res) {
    const { newPassword, id } = req.body
    if (!newPassword) {
        return res.status(500).json({ error: 'please provide password', status: false });
    }
    if (!id) {
        return res.status(500).json({ error: 'please provide id', status: false });
    }
    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            console.error('Password hashing failed: ' + hashErr);
            return res.status(500).json({ error: 'Internal server error', status: false });
        }

        connection.query(
            'UPDATE my_tech.users_tbl SET password = "' + hashedPassword + '" , password_bcrypt="' + newPassword + '" where id= "' + id + '"',
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
function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields', status: false });
        }

        connection.query(
            'SELECT id, email, password FROM my_tech.users_tbl WHERE email = ?',
            [email],
            (err, results) => {

                if (err) {
                    console.error('Database query failed: ' + err);
                    return res.send({ error: 'Internal server error', status: false });
                }
                if (results.length === 0) {
                    return res.send({ error: 'this email id not register' });
                }

                const user = results[0];

                // if (user.status == 1) {
                bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
                    if (bcryptErr) {
                        console.error('Password comparison failed: ' + bcryptErr);
                        return res.send({ error: 'Password wrong', status: false });
                    }

                    if (!bcryptResult) {
                        return res.send({ error: 'Authentication failed' });
                    }

                    const token = jwt.sign({ userId: user.id, email: user.email }, 'secret_key', {
                        expiresIn: '1h',
                    });
                    const userId = user.id
                    res.send({ msg: "login successfully", token, userId });
                });
                // } else {
                //     return res.status(200).json({ error: 'pleace contact admin', status: true });
                // }
            }
        );
    }
    catch (error) {
        console.log(error);
        return res.send({ data: error, status: false })
    }
}


const sentOtp = async (req, res) => {
    try {
        const { email, mobile_num } = req.body
        if (email === '' || mobile_num === '') {
            return res.status(200).json({ error: true, message: "Please enter the email or mobile number", data: null })
        }
        if (email) {
            const otp = generateOTP();
            const mailOptions = {
                from: 'anmolrajputzixisoft@gmail.com',
                to: email,
                subject: " OTP",
                text: ` OTP code is: ${otp}`
            };

            connection.query(
                'SELECT *  FROM my_tech.users_tbl WHERE email = ?',
                [email],
                (err, results) => {

                    if (err) {
                        console.error('Database query failed: ' + err);
                        return res.send({ error: 'Internal server error', status: false });
                    }
                    if (results.length == 0) {
                        return res.send({ success: false, error: 'this email id not register' });
                    }
                    else {
                        const user = results[0];

                        connection.query(
                            `UPDATE my_tech.users_tbl SET  otp=? WHERE email=?`,
                            [otp, user.email],
                            (err, result1) => {
                                if (err) {
                                    console.error('Update error:', err);
                                    return res.status(500).json({ error: 'Update error' });
                                }
                                else {

                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            return res.send({ error: error })
                                        } else {
                                            console.log('Email sent: ');
                                        }
                                    })
                                    return res.status(200).json({ success: true, message: `otp sent  Email ${otp}`, data: user });
                                }
                            }
                        );

                    }
                }
            );
        } else {
            try {
                const phoneNum = mobile_num

                const userId = "testdemo"
                const password = "cbhe1755CB"
                const senderID = "SKYPND"
                const otp = generateOTP()
                const templateId = "1707169605608892872"
                const entityID = "1701157319958638363"
                const msg = `INVEST AND EARN FOR LIFE Lease guaranteed Shops Assured Returns@12% Sec 133 noida Pay 48 Lac Get 48k per month till possession Limited Units ${otp} SKYLED`

                connection.query(
                    'SELECT *  FROM my_tech.users_tbl WHERE mobile_number = ?',
                    [phoneNum],
                    (err, results) => {

                        if (err) {
                            console.error('Database query failed: ' + err);
                            return res.send({ error: 'Internal server error', status: false });
                        }
                        if (results.length == 0) {
                            return res.send({ success: false, error: 'this mobile number  is not register' });
                        }
                        else {
                            const user = results[0];

                            connection.query(
                                `UPDATE my_tech.users_tbl SET  otp=? WHERE mobile_number=?`,
                                [otp, user.mobile_number],
                                (err, result1) => {
                                    if (err) {
                                        console.error('Update error:', err);
                                        return res.status(500).json({ error: 'Update error' });
                                    }
                                    else {
                                        const response = axios.get(`http://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=${userId}&Password=${password}&SenderID=${senderID}&Phno=${phoneNum}&Msg=${msg}&EntityID=${entityID}&TemplateID=${templateId}`);
                                        console.log('SMS sent successfully:', response.data);
                                        return res.status(200).json({ success: true, message: `otp sent Number ${otp}`, data: user });
                                    }
                                }
                            );

                        }
                    }
                );
                // Handle the response accordingly
            } catch (error) {
                console.error('Error sending SMS:');
            }
        }
    } catch (error) {
        console.log(error);
        return res.send({ error: error, success: false })
    }

}




module.exports = { login, verifyByOtp, sentOtp, setPass }