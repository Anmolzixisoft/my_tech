const connection = require('../database/mysqldb')

function productAdd(req, res) {
    try {
        const { Product_Name, MRP, Selling_Price } = req.body
        const { Image } = req.files
        if (!Image) {
            return res.send({ error: "insert image" })
        }
        const file = Image[0].filename

        const sql = 'INSERT INTO my_tech.product_tbl (Product_Name, MRP, Selling_Price, Image) VALUES (?, ?, ?,?)';
        const values = [
            Product_Name,
            MRP,
            Selling_Price,
            file,

        ];
        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database insertion error: ' + err.message);
                res.status(500).json({ error: 'Error inserting data into the database' });
            } else {
                console.log('Data inserted into the database.');
                res.status(200).json({ message: 'Projuct Added' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.send({ error: error })
    }

}

function getProduct(req, res) {
    try {
        connection.query('SELECT * FROM my_tech.product_tbl', (err, result) => {
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




module.exports = { productAdd, getProduct }

