const connection = require('../database/mysqldb')

function purchaseQr(req, res) {
    try {
        const { product_id, user_id } = req.body;

        // Check if the product_id exists in the database
        const checkSql = 'SELECT * FROM my_tech.purchase_QR_tbl WHERE product_id = ?';
        connection.query(checkSql, [product_id], (err, result) => {
            if (err) {
                console.error('Database selection error: ' + err.message);
                return res.status(500).json({ error: 'Error checking data in the database' });
            } else {
                if (result.length > 0) {
                    // Product with the provided ID already exists
                    return res.status(200).json({ message: 'Product not available' });
                } else {
                    // Insert the product_id and user_id into the database
                    const sql = 'INSERT INTO my_tech.purchase_QR_tbl (product_id, user_id) VALUES (?, ?)';
                    const values = [product_id, user_id];

                    connection.query(sql, values, (err, result) => {
                        if (err) {
                            console.error('Database insertion error: ' + err.message);
                            return res.status(500).json({ error: 'Error inserting data into the database' });
                        } else {
                            console.log('Data inserted into the database.');
                            return res.status(200).json({ message: 'Success' });
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ error: 'Server error' });
    }
}

function getMobileNo(req, res) {
    try {
        const { product_id } = req.body

        connection.query(`SELECT
        my_tech.purchase_QR_tbl.user_id ,my_tech.users_tbl.mobile_number
   FROM
   my_tech.purchase_QR_tbl
   LEFT JOIN my_tech.users_tbl ON my_tech.users_tbl.id = my_tech.purchase_QR_tbl.user_id
   WHERE
   my_tech.purchase_QR_tbl.product_id = ${product_id}`, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err });
            }
            if (result.length == 0) {
                return res.status(500).json({ message: 'not found any number', data: null });
            }
            else {
                return res.status(200).json({ message: 'success', data: result });
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
        my_tech.product_tbl.Image,my_tech.product_tbl.Product_Name,my_tech.product_tbl.	Selling_Price
        FROM my_tech.purchase_QR_tbl
        INNER JOIN my_tech.users_tbl ON my_tech.users_tbl.id = my_tech.purchase_QR_tbl.user_id
        INNER JOIN my_tech.product_tbl ON my_tech.product_tbl.id = my_tech.purchase_QR_tbl.product_id;`, (err, result) => {
            if (err) {
                console.error('Database insertion error: ' + err.message);
                return res.status(500).json({ error: 'Error inserting data into the database' });
            } else {

                return res.status(200).json({ data: result, message: 'success' });

            }
        })
    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ error: 'Server error' });
    }
}
module.exports = { purchaseQr, getMobileNo, getpurchaseinfo }