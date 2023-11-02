const connection = require('../database/mysqldb')
const QRCode = require('qrcode')

function productAdd(req, res) {
    try {
        const { Product_Name, MRP, Selling_Price } = req.body;

        const sql = 'INSERT INTO my_tech.product_tbl (Product_Name, MRP, Selling_Price) VALUES (?, ?, ?)';
        const values = [Product_Name, MRP, Selling_Price];

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

                    connection.query(`UPDATE my_tech.product_tbl SET Image= '${code}'  WHERE product_tbl.id =${result.insertId}`, values, (err, result) => {
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
                // result.forEach(element => {
                //     element.Image = `http://localhost:5501/Backend/public/${element.Image}`;
                // });
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
        const { id, Product_Name, MRP, Selling_Price, status } = req.body;

        const { Image } = req.files;

        var image = '';
        if (typeof Image !== 'undefined') {
            image = ', `Image` = "' + Image[0].filename + '" ';
        }

        const sql = 'UPDATE my_tech.product_tbl SET  Product_Name= ?, MRP= ?,	Status=? , Selling_Price=?' + image + 'WHERE id= ?'
        connection.query(sql, [Product_Name, MRP, status, Selling_Price, id], (err, result) => {
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
                    element.Image = `http://localhost:5501/Backend/public/${element.Image}`;
                });
                return res.status(200).json({ message: result[0] });

            }
        })
    } catch (error) {
        return res.status(500).json({ error: error });

    }
}
module.exports = { productAdd, getProduct, deleteProduct, editproduct, getProductbyid }

