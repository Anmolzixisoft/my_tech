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
            return res.status(200).json({ status: false, error: true, message: "Please provide the id", data: null })
        }
        if (otp === '') {
            return res.status(200).json({ status: false, error: true, message: "Please provide the otp", data: null })
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
                    return res.send({ error: 'this email id not register', status: false });
                }

                const user = results[0];

                // if (user.status == 1) {
                bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
                    if (bcryptErr) {
                        console.error('Password comparison failed: ' + bcryptErr);
                        return res.send({ error: 'Password wrong', status: false });
                    }

                    if (!bcryptResult) {
                        return res.send({ error: 'Authentication failed', status: false });
                    }

                    const token = jwt.sign({ userId: user.id, email: user.email }, 'secret_key', {
                        expiresIn: '1h',
                    });
                    const userId = user.id
                    res.send({ msg: "login successfully", token, userId, status: true });
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
        if (email == '' && mobile_num == '') {
            return res.status(200).json({ status: false, error: true, message: "Please enter the email or mobile number", data: null })
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
                            `UPDATE my_tech.users_tbl SET otp=? WHERE email=?`,
                            [otp, user.email],
                            (err, result1) => {
                                if (err) {
                                    return res.status(500).json({ error: 'Update error', status: false });
                                } else {
                                    // Assuming 'email' is unique, performing a SELECT after the UPDATE
                                    connection.query(
                                        'SELECT * FROM my_tech.users_tbl WHERE email = ?',
                                        [user.email],
                                        (selectErr, selectResult) => {
                                            if (selectErr) {
                                                return res.status(500).json({ error: 'Select error', status: false });
                                            }
                                            const user = selectResult[0];
                                            
                                            // Continue with sending the email
                                            transporter.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    return res.send({ error: error, status: false })
                                                } else {
                                                    console.log('Email sent: ');
                                                }
                                            });
                        
                                            return res.status(200).json({ status: true, message: `OTP sent via Email: ${otp}`, data: user });
                                        }
                                    );
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
                            return res.send({ status: false, error: 'this mobile number  is not register' });
                        }
                        else {
                            const user = results[0];

                            connection.query(
                                `UPDATE my_tech.users_tbl SET otp=? WHERE mobile_number=?`,
                                [otp, user.mobile_number],
                                (err, result1) => {
                                    if (err) {
                                        console.error('Update error:', err);
                                        return res.status(500).json({ error: 'Update error', status: false });
                                    } else {
                                        // Assuming 'mobile_number' is unique, performing a SELECT after the UPDATE
                                        connection.query(
                                            'SELECT * FROM my_tech.users_tbl WHERE mobile_number = ?',
                                            [user.mobile_number],
                                            (selectErr, selectResult) => {
                                                if (selectErr) {
                                                    return res.status(500).json({ error: 'Select error', status: false });
                                                }
                                                const user = selectResult[0];
                            
                                                // After successful SELECT, send SMS
                                                axios.get(`http://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=${userId}&Password=${password}&SenderID=${senderID}&Phno=${phoneNum}&Msg=${msg}&EntityID=${entityID}&TemplateID=${templateId}`)
                                                    .then(response => {
                                                        console.log('SMS sent successfully:', response.data);
                                                        return res.status(200).json({ status: true, message: `OTP sent to Number ${otp}`, data: user });
                                                    })
                                                    .catch(smsError => {
                                                        console.error('SMS sending error:', smsError);
                                                        return res.status(500).json({ error: 'SMS sending error', status: false });
                                                    });
                                            }
                                        );
                                    }
                                }
                            );
                            

                        }
                    }
                );
                // Handle the response accordingly
            } catch (error) {
                console.error('Error sending SMS:');
                return res.send({ error: error, success: false })
            }
        }
    } catch (error) {
        console.log(error);
        return res.send({ error: error, success: false })
    }

}


const adminLogin = (req, res) => {
    try {
        const user = req.body;
        if (user.email === '') {
            const error = "Please enter the email";
            return res.status(200).json({ status: false, error: true, message: `${error}`, data: null })
        }
        if (user.password === '') {
            const error = "Please enter the password";
            return res.status(200).json({ status: flase, error: true, message: `${error}`, data: null })
        }
        connection.query('SELECT * FROM my_tech.admin_tbl WHERE email = "' + user.email + '"', (error, findEmail) => {
            if (error) {
                return res.status(200).json({ status: false, error: true, message: `${error}`, data: null })
            }
            if (findEmail[0] == undefined) {
                const error = "Incorrect Email";
                return res.status(200).json({ status: false, error: true, message: `${error}`, data: null })
            } else {
                if (findEmail[0].password === user.password) {
                    const token = jwt.sign({ userId: findEmail[0].id }, 'thisismyadminsceretkey');
                    findEmail[0].token = token;
                    return res.status(200).json({ status: true, error: false, message: "Successfully Login", data: findEmail })
                } else {
                    const error = "Incorrect password";
                    return res.status(200).json({ status: false, error: true, message: `${error}`, data: null })
                }
            }
        })
    } catch (err) {
        return res.status(500).json({ status: false, error: true, message: `${err}`, data: null })
    }
}

function activeDiactiveUser(req, res) {
    const { userId, status } = req.body
    connection.query('select * from my_tech.users_tbl where id="' + userId + '" ', (err, result) => {
        if (err) {
            return res.send({ error: err, status: false }
            )
        }
        if (result.length == 0) {
            return res.send({ error: " user not found ", status: false })
        }
        else {
            connection.query('UPDATE my_tech.users_tbl SET status="' + status + '"  where id="' + userId + '"', (err, result) => {
                if (err) {
                    return res.send({ error: err, status: false })
                }
                else {
                    return res.send({ message: "succesfully", status: true })
                }
            })

        }
    })
}


module.exports = { login, verifyByOtp, sentOtp, setPass, adminLogin, activeDiactiveUser }