const connection = require('../database/mysqldb')
const QRCode = require('qrcode')

function productAdd(req, res) {
    try {
        const { Product_Name, MRP, Selling_Price, description } = req.body;
        const { Image } = req.files
        if (!Image) {
            return res.send({ error: "insert image" })
        }
        const file = Image[0].filename
        const sql = 'INSERT INTO my_tech.product_tbl (Product_Name, MRP, Selling_Price,Image,description) VALUES (?,?, ?, ?,?)';
        const values = [Product_Name, MRP, Selling_Price, file, description];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database insertion error: ' + err.message);
                res.status(500).json({ error: 'Error inserting data into the database' });
            } else {
                var id = result.insertId
                var redirectURL = `http://192.168.29.179:5501/Info-tags/index.html?id=${id}`

                QRCode.toDataURL(redirectURL, function (err, code) {
                    if (err) {
                        console.log("Error occurred while generating QR code:", err);
                        return res.status(500).json({ error: "Error generating QR code" });
                    }

                    connection.query(`UPDATE my_tech.product_tbl SET QR_code= '${code}'  WHERE product_tbl.id =${result.insertId}`, values, (err, result) => {
                        if (err) {
                            console.error('Database insertion error: ' + err.message);
                            res.status(500).json({ error: 'Error inserting data into the database' });
                        } else {

                            console.log('Data inserted into the database.');
                            res.status(200).json({ message: 'Product Added' });
                        }
                    })

                });




            }
        });

    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).json({ error: 'Server error' });
    }

}

function getProduct(req, res) {
    try {
        connection.query('SELECT * FROM my_tech.product_tbl  ORDER BY product_tbl.id DESC', (err, result) => {
            if (err) {
                return res.send({ error: err })
            } else {
                result.forEach(element => {
                    element.Image = `http://192.168.29.179:5501/Backend/public/${element.Image}`;
                });
                return res.send({ message: result })
            }
        })
    } catch (error) {
        return res.send({ error: error })
    }
}

function deleteProduct(req, res) {
    try {
        const { productid } = req.body

        connection.query('DELETE FROM my_tech.product_tbl WHERE id = "' + productid + '"', (err, result) => {
            if (err) {
                return res.send({ error: err, status: false })
            }
            else {
                return res.send({ message: "product delete", status: true })
            }
        })
    } catch (error) {

        return res.send({ error: error, status: false })
    }
}

function editproduct(req, res) {
    try {

        const { id, Product_Name, MRP, Selling_Price, status, description } = req.body;

        const { Image } = req.files;

        var image = '';
        if (typeof Image !== 'undefined') {
            image = ', `Image` = "' + Image[0].filename + '" ';
        }

        const sql = 'UPDATE my_tech.product_tbl SET  Product_Name= ?, MRP= ?,	Status=? , description=?,Selling_Price=?' + image + 'WHERE id= ?'
        connection.query(sql, [Product_Name, MRP, status, description, Selling_Price, id], (err, result) => {
            if (err) {
                console.error('Database update error: ' + err.message);
                res.status(500).json({ error: 'Error updating data in the database' });
            }
            else {
                console.log('Data updated in the database.');
                res.status(200).json({ message: 'Product Updated', status: true });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }

}

function getProductbyid(req, res) {
    try {
        const { productid } = req.body
        if (!productid) {
            return res.status(400).json({ error: "Product ID is required" });
        }
        connection.query('select * from my_tech.product_tbl where  id ="' + productid + '"', (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });

            }
            else {
                result.forEach(element => {
                    element.Image = `http://192.168.29.179:5501/Backend/public/${element.Image}`;
                });
                return res.status(200).json({ message: result[0] });

            }
        })
    } catch (error) {
        return res.status(500).json({ error: error });

    }
}
function addDetailslipment(req, res) {
    try {
        const { user_id, product_id, QR_Code_Numbe, Courier_Detail, Courier_ID } = req.body;
        console.log(req.body);

        var redirectURL = `http://192.168.29.179:5501/Info-tags/index.html?id=${QR_Code_Numbe}`

        connection.query('SELECT QR_Code_Numbe FROM my_tech.purchase_QR_tbl WHERE QR_Code_Numbe="' + QR_Code_Numbe + '"', (err, qrnum) => {
            if (err) {
                console.log("Error occurred while generating QR code:", err);
                return res.status(500).json({ error: "Error generating QR code" });
            }
            if (qrnum == 0) {
                QRCode.toDataURL(redirectURL, function (err, code) {
                    if (err) {
                        console.log("Error occurred while generating QR code:", err);
                        return res.status(500).json({ error: "Error generating QR code" });
                    }

                    connection.query('UPDATE my_tech.purchase_QR_tbl SET  QR_Code_Numbe= "' + QR_Code_Numbe + '", Courier_Detail= "' + Courier_Detail + '",delivered_status="1",Courier_ID="' + Courier_ID + '" ,QR_code="' + code + '" WHERE id  ="' + user_id + '"', (err, result) => {

                        if (err) {
                            console.error('Database update error: ' + err.message);
                            return res.status(200).json({ error: 'Error updating data in the database' });
                        }
                        // if (result.affectedRows == 1) {
                        return res.status(200).json({ error: false, message: "Shipment successfully add", data: result });
                        // } else {
                        //     console.log('erererere');
                        //      return res.status(200).json({ error: true, err: "Shipment not be add", data: null });
                        // }
                    });

                });
            }
            else {
                return res.send({ error: true, err: "this QR_number alreay added" })
            }
        })




    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }

}

function delivered_status_change(req, res) {
    try {

        const { id, user_id, delivered_status } = req.body;
        const sql = 'UPDATE my_tech.purchase_QR_tbl SET  delivered_status="2" WHERE user_id= "' + user_id + '" AND 	id="' + id + '"'

        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database update error: ' + err.message);
                res.status(200).json({ error: 'Error updating data in the database' });
            }
            if (result.affectedRows == 1) {
                console.log(result);
                res.status(200).json({ error: false, message: "delivered_status successfully change", data: result });
            } else {
                res.status(200).json({ error: true, message: "delivered_status not be change", data: null });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }

}
module.exports = { productAdd, getProduct, deleteProduct, editproduct, getProductbyid, addDetailslipment, delivered_status_change }

