const connection = require('../database/mysqldb')

const accountSid = "ACcc7b1e66b119f2e345827ff445c77620";
const authToken = "bf4b97b8b0045649124531ec335ff854";
const client = require("twilio")(accountSid, authToken);
const axios = require('axios')
function purchaseQr(req, res) {
    try {
        const { product_id, user_id, address, state, city, pincode } = req.body;
        connection.query('SELECT * FROM my_tech.purchase_QR_tbl WHERE product_id = "' + product_id + '" AND user_id= "' + user_id + '"', (err, dupicate) => {
            if (err) {
                console.error('Database  error: ' + err.message);
                return res.status(500).json({ status: false, error: err.message });
            }

            if (dupicate == 0) {
                const sql = 'INSERT INTO my_tech.purchase_QR_tbl (product_id, user_id,address, state, city, pincode) VALUES (?, ?,?,?,?,?)';
                const values = [product_id, user_id, address, state, city, pincode];

                connection.query(sql, values, (err, result) => {
                    if (err) {
                        console.error('Database insertion error: ' + err.message);
                        return res.status(500).json({ status: false, error: 'Error inserting data into the database' });
                    } else {
                        console.log('Data inserted into the database.');
                        return res.status(200).json({ status: true, message: 'Success' });
                    }
                });
            }
            else {

                return res.status(200).json({ status: false, message: 'you are already purchased' });
            }
        })

    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ status: false, error: 'Server error' });
    }
}
function generateOTP() {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }

    return otp;
}




function getMobileNo(req, res) {
    try {
        const { product_id, vehicle_number } = req.body
        const userId = "testdemo"
        const password = "cbhe1755CB"
        const senderID = "SKYPND"
        const otp = generateOTP()
        const templateId = "1707169605608892872"
        const entityID = "1701157319958638363"
        const msg = `INVEST AND EARN FOR LIFE Lease guaranteed Shops Assured Returns@12% Sec 133 noida Pay 48 Lac Get 48k per month till possession Limited Units ${otp} SKYLED`

        console.log(product_id, vehicle_number);
        if (!vehicle_number) {
            return res.send({ status: false, error: ' please add vehicle number', data: null })
        }
        connection.query('SELECT * FROM my_tech.vehicle_info_tbl  WHERE QR_Code_Numbe="' + product_id + '" AND vehicle_number="' + vehicle_number + '" ', (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ status: false, error: err });
            }
            else {

                if (result.length == 0) {
                    return res.status(200).json({ status: false, error: 'please add  right vehicle number', data: null });
                }
                else {

                    connection.query(`SELECT
                    my_tech.purchase_QR_tbl.user_id ,my_tech.users_tbl.mobile_number
               FROM
               my_tech.purchase_QR_tbl
               LEFT JOIN my_tech.users_tbl ON my_tech.users_tbl.id = my_tech.purchase_QR_tbl.user_id
               WHERE
               my_tech.purchase_QR_tbl.	QR_Code_Numbe = ${product_id}`, (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ error: err, status: false, });
                        }
                        if (result.length == 0) {

                            return res.send({ status: false, error: 'this mobile number  is not register' });
                        }
                        else {
                            console.log(result[0].mobile_number);


                            var number = result[0].mobile_number
                            const otp = generateOTP()

                            connection.query(
                                'SELECT * FROM my_tech.users_tbl WHERE mobile_number = ?',
                                [number],
                                (selectErr, selectResult) => {
                                    if (selectErr) {
                                        return res.status(500).json({ error: 'Select error', status: false });
                                    }
                                    const user = selectResult[0];

                                    // After successful SELECT, send SMS
                                    axios.get(`http://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=${userId}&Password=${password}&SenderID=${senderID}&Phno=${number}&Msg=${msg}&EntityID=${entityID}&TemplateID=${templateId}`)
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
        })


    } catch (error) {
        return res.status(500).json({ error: error });

    }
}

function getpurchaseinfo(req, res) {
    try {
        connection.query(`SELECT 
        my_tech.purchase_QR_tbl.*,
        my_tech.users_tbl.name , my_tech.users_tbl.mobile_number,
        my_tech.product_tbl.Image,my_tech.product_tbl.Product_Name,my_tech.product_tbl.Selling_Price
        FROM my_tech.purchase_QR_tbl
        LEFT JOIN my_tech.users_tbl ON my_tech.users_tbl.id = my_tech.purchase_QR_tbl.user_id
        LEFT JOIN my_tech.product_tbl ON my_tech.product_tbl.id = my_tech.purchase_QR_tbl.product_id`, (err, result) => {
            if (err) {
                console.error('Database insertion error: ' + err.message);
                return res.status(500).json({ error: 'Error inserting data into the database' });
            } else {
                result.forEach(element => {
                    element.Image = `http://192.168.29.179:5501/Backend/public/${element.Image}`;
                });
                return res.status(200).json({ data: result, message: 'success' });

            }
        })
    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ error: 'Server error' });
    }
}


function getpurchaseinfoPatycular(req, res) {
    try {
        const { userid } = req.body

        // SELECT 
        // my_tech.purchase_QR_tbl.*,
        // my_tech.users_tbl.*,
        // my_tech.product_tbl.Image,my_tech.product_tbl.QR_code,my_tech.product_tbl.Product_Name,my_tech.product_tbl.	Selling_Price,my_tech.product_tbl.QR_Code_Numbe,my_tech.product_tbl.delivered_status
        // FROM my_tech.purchase_QR_tbl
        // INNER JOIN my_tech.users_tbl ON my_tech.users_tbl.id = my_tech.purchase_QR_tbl.user_id
        // INNER JOIN my_tech.product_tbl ON my_tech.product_tbl.id = my_tech.purchase_QR_tbl.product_id where  my_tech.users_tbl.id=${userid}
        connection.query(`SELECT 
        u.*, 
        s.name AS state_name, 
        c.name AS city_name,
        pq.*,
        p.Image,
        p.Created_Date AS product_Created_Date,
        p.QR_code,
        p.Product_Name,
        p.Selling_Price
    FROM my_tech.purchase_QR_tbl AS pq
    INNER JOIN my_tech.users_tbl AS u ON u.id = pq.user_id
    INNER JOIN my_tech.product_tbl AS p ON p.id = pq.product_id
    LEFT JOIN my_tech.tbl_states AS s ON u.state = s.id
    LEFT JOIN my_tech.tbl_cities AS c ON u.city = c.id
    WHERE u.id = ${userid};
    `, (err, result) => {
            if (err) {
                console.error('Database insertion error: ' + err.message);
                return res.status(500).json({ error: 'Error inserting data into the database' });
            } else {
                result.forEach(element => {
                    element.Image = `http://192.168.29.179:5501/Backend/public/${element.Image}`;
                    element.profile_image = `http://192.168.29.179:5501/Backend/public/${element.profile_image}`
                });
                const user = result[0]
                return res.status(200).json({ data: user, message: 'success' });

            }
        })
    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ error: 'Server error' });
    }
}
module.exports = { purchaseQr, getMobileNo, getpurchaseinfo, getpurchaseinfoPatycular }