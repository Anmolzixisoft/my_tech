const connection = require('../database/mysqldb')
var nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');


function generateOTP() {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }

    return otp;
}
var transporter = nodemailer.createTransport({
    host: "tls://smtp.gmail.com",
    service: 'gmail',
    port: 587,
    auth: {
        user: 'anmolrajputzixisoft@gmail.com',
        pass: 'drqy nyew vhaw zvxx',
    }
});

function isValidMobileNumber(mobile_number) {

    const mobileRegex = /^[0-9]{10}$/;

    return mobileRegex.test(mobile_number);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getuser(req, res) {
    try {
        connection.query("SELECT * FROM my_tech.users_tbl", (err, result) => {

            return res.send({ data: result, status: true })
        })
    }
    catch (error) {
        return res.send({ data: error, status: false })
    }
}

function getuserById(req, res) {
    try {
        const { id } = req.body
        if (!id) {
            return res.send({ message: "id not found " })
        }
        const query = `
        SELECT u.*, s.name AS state_name, c.name AS city_name
        FROM my_tech.users_tbl AS u
        LEFT JOIN my_tech.tbl_states AS s ON u.state = s.id
        LEFT JOIN my_tech.tbl_cities AS c ON u.city = c.id
        WHERE u.id = ${id}
    `;

        connection.query(query, (err, result) => {
            if (err) {
                console.log(err);
                return res.send({ data: err, status: false })

            }
            if (result[0] == undefined) {
                return res.status(200).json({ status: false, message: "user not found " });
            } else {
                result.forEach(element => {
                    element.profile_image = `http://192.168.29.179:5501/Backend/public/${element.profile_image}`
                    element.aadhar_image = `http://192.168.29.179:5501/Backend/public/${element.aadhar_image}`
                    element.license_image = `http://192.168.29.179:5501/Backend/public/${element.license_image}`
                    element.aadhar_image_back = `http://192.168.29.179:5501/Backend/public/${element.aadhar_image_back}`

                });


                const user = result[0]
                return res.send({ data: user, status: true })

            }
        })
    }
    catch (error) {
        return res.send({ data: error, status: false })
    }
}

function signUp(req, res) {
    try {
        const { name, email, mobile_number, password } = req.body;
        if (!name || !email || !mobile_number || !password) {
            return res.status(400).json({ error: 'Missing required fields', status: false });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format', status: false });
        }

        if (!isValidMobileNumber(mobile_number)) {
            return res.status(400).json({ error: 'Invalid mobile number format', status: false });
        }

        const otp = generateOTP();

        connection.query(
            'SELECT * FROM my_tech.users_tbl WHERE email = ? ',
            [email],
            (err, results) => {
                if (err) {
                    console.error('Error checking email existence: ' + err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (results.length > 0) {
                    return res.status(409).json({ status: false, message: `User already registered with this email` });
                } else {
                    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                        if (hashErr) {
                            console.error('Password hashing failed: ' + hashErr);
                            return res.status(500).json({ error: 'Internal server error', status: false });
                        }
                        connection.query(
                            'INSERT INTO my_tech.users_tbl (name, email, mobile_number, password,password_bcrypt,otp) VALUES (?,?, ?,?, ?,?)',
                            [name, email, mobile_number, hashedPassword, password, otp],
                            (err, result) => {
                                if (err) {
                                    console.error('Error inserting data: ' + err);
                                    return res.status(500).json({ error: 'Error inserting data', status: false });
                                } else {
                                    console.log("succsessss");


                                    return res.status(200).json({ data: result, status: true, message: ` successful SingUp`, otp: otp, userId: result.insertId });
                                }
                            }
                        );
                    }

                    );
                }
            }
        );


    } catch (error) {
        console.log('update  error ->', error);
        return res.send({ data: error, status: false })
    }
}


function sendVerificationMail(req, res) {
    const email = req.body.email
    if (!email) {
        return res.send({ error: "please fill email" })
    }

    const otp = generateOTP();
    console.log(otp, 'otp');
    const mailOptions = {
        from: 'anmolrajputzixisoft@gmail.com',
        to: email,
        subject: "SignUp OTP",
        text: ` OTP code is: ${otp}`
    };

    connection.query(
        'SELECT * FROM landsharein_db.tbl_user WHERE email = ? ',
        [email],
        (err, results) => {
            if (err) {
                console.error('Error checking email existence: ' + err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length > 0) {
                connection.query(
                    `UPDATE landsharein_db.tbl_user SET otp=? WHERE email=?`,
                    [otp, email],
                    (err, result1) => {
                        if (err) {
                            console.error('Update error:', err);
                            return res.status(500).json({ error: 'Update error' });
                        }
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log('------------------', error);
                            } else {
                                console.log('Email sent: ');
                            }
                        })
                        return res.status(200).json({ data: result1, status: true, msg: `sent mail successful ${otp}` });
                    }
                );
            } else {
                connection.query(
                    'INSERT INTO landsharein_db.tbl_user (name, email, mobile_number, password,otp) VALUES (?, ?,?, ?, ?)',
                    ["", email, "", "", otp],
                    (err, result) => {
                        if (err) {
                            console.error('Error inserting data: ' + err);
                            return res.status(500).json({ error: 'Error inserting data', status: false });
                        } else {
                            console.log("succsessss");
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log('------------------', error);
                                } else {
                                    console.log('Email sent: ');
                                }
                            })
                            return res.status(200).json({ data: result, status: true, msg: `sent mail successful ${otp}` });
                        }
                    }
                );
            }
        }
    );


}

function AdduserDetails(req, res) {
    try {
        console.log(req.body);
        const { id, name, email, mobile_number, emergency_mobile_number, aadhar_no, license_no, address, state, city, pincode } = req.body;

        const { aadhar_image, license_image, profile_image, aadhar_image_back } = req.files
        // if (!aadhar_image || !license_image || !profile_image) {
        //     return res.send({ error: "insert file " })
        // }

        var aadhar_image_update = '';
        var license_image_update = '';
        var profile_image_update = '';
        var aadhar_image_back_update = '';

        if (typeof license_image !== 'undefined') {
            license_image_update = ', license_image = "' + license_image[0].filename + '" ';
        }

        if (typeof aadhar_image !== 'undefined') {
            aadhar_image_update = ', aadhar_image = "' + aadhar_image[0].filename + '" ';
        }

        if (typeof profile_image !== 'undefined') {
            profile_image_update = ', profile_image = "' + profile_image[0].filename + '" ';
        }

        if (typeof aadhar_image_back !== 'undefined') {
            aadhar_image_back_update = ', aadhar_image_back = "' + aadhar_image_back[0].filename + '" ';
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format', status: false });
        }

        if (!isValidMobileNumber(mobile_number)) {
            return res.status(400).json({ error: 'Invalid mobile number format', status: false });
        }

        connection.query(
            'SELECT * FROM my_tech.users_tbl WHERE id = ? ',
            [id],
            (err, results) => {
                if (err) {
                    console.error('Error checking email existence: ' + err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (results.length > 0) {

                    const sql = 'UPDATE my_tech.users_tbl SET name=?,email=?,mobile_number=?' + profile_image_update + ',' + 'emergency_mobile_number=?,aadhar_no=?' + aadhar_image_update + '' + aadhar_image_back_update + ',' + 'license_no=?' + license_image_update + ',' + 'address=?,state=?,city=?,pincode=?,profile_completed= "1" WHERE id = ?'

                    connection.query(sql, [name, email, mobile_number, emergency_mobile_number, aadhar_no, license_no, address, state, city, pincode, id],
                        (err, result) => {
                            if (err) {
                                console.error('Update error:', err);
                                return res.status(500).json({ error: 'Update error' });
                            }

                            return res.status(200).json({ status: true, message: ` successful ` });
                        }
                    );
                } else {
                    return res.send({ message: "user not found" })
                }
            }
        );




    } catch (error) {
        console.log('update  error ->', error);
        return res.send({ data: error, status: false })
    }


}



function verifyotp(req, res) {
    try {
        const { user_id, otp } = req.body
        connection.query('select otp from my_tech.users_tbl where id="' + user_id + '"', (err, result) => {
            if (err) {
                return res.send({ status: false, error: err })
            } else {
                console.log(result[0].otp);
                if (result[0].otp == otp) {
                    return res.send({ status: true, message: " otp verify successfully" })
                }
                else {
                    return res.send({ status: false, message: "otp not verify" })
                }
            }
        })
    } catch (error) {
        return res.send({ error: error, status: false })
    }
}

module.exports = { signUp, getuser, sendVerificationMail, verifyotp, AdduserDetails, getuserById }


