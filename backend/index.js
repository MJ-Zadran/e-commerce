const express = require("express");
const db = require("./db");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { error } = require("console");
const bcrypt = require('bcrypt');


const port = 4000; 
const app = express();

app.use(express.json());
app.use(cors());

// API creation
app.get("/", (req, res) => {
    res.send('Express App is Running');    
})

//  multer to upload the images to the storge
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});
const upload = multer({storage:storage});

// creating upload endpoint for images
app.use('/images', express.static('upload/images'));

app.post('/upload', upload.single('product'), (req, res) =>{
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
} ) ;

// Creating API for Adding Product
app.post('/addproduct', async(req, res) => {
    const { name, image, category, new_price, old_price } = req.body;
    const result = await db.query(
      'INSERT INTO product (name, image, category, new_price, old_price) VALUES ($1, $2, $3, $4, $5) RETURNING * ',
      [name, image, category, new_price, old_price]
    ); 
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for deleting product
app.post('/removeproduct', async (req, res) => {
    const {id} = req.body;
    const result = await db.query("DELETE FROM product WHERE id = ($1) ",
        [id]
    )
    console.log("Removed")
    res.json({
        success: true,
        name: id,
    })
})

// Creating API for getting all product
app.get('/allproducts', async(req, res) =>{
    const result = await db.query("SELECT * FROM product");
    console.log("All Products Fetched");
    res.send(result.rows);
})

// API for User creation
app.post('/signup', async(req, res) => {
    const {name, email, password} = req.body;

     // Hash the password with a salt (default: 10 rounds)
     const hashedPassword = await bcrypt.hash(password, 10);
    
    const check = await db.query('SELECT * FROM users WHERE email = ($1)',
        [email]
    );
    console.log(check.rows)
    if(check.rows.length > 0){
        return res.status(400).json({success: false, error: "Existing user found with same email address"});
    }
    
    const result = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, hashedPassword]
    )

    // Retrieve the inserted user
    const user = result.rows[0];
    const data = {
        user: {
            id:user.id
        }
    }

    const token = jwt.sign(data,"secret_ecom")
    res.json({
        success: true,
        token
    })
})

// Creating EndPoint for User Login
app.post('/login', async(req,res) => {
    const {email, password}  = req.body;
    const result = await db.query("SELECT * FROM users WHERE email = ($1)",
        [email]
    );

    if(result.rows.length === 0){
        return res.status(400).json({success: false, error: "Existing user is not found with same email address"});
    }

    // Retrieve the inserted user
    const passwordKey = result.rows[0].password;
    console.log(passwordKey)

    const isMatch = await bcrypt.compare(password, passwordKey)
    if(isMatch){
        const user = result.rows[0];
        const data = {
            user: {
                id:user.id
            }
        }
    
        const token = jwt.sign(data,"secret_ecom")
        res.json({success: true,token})
    }else{
        res.json("The Password is incorrect!")
    }


})

// Creating end point for new_collection data
app.get('/newcollections', async (req,res) => {
    const result = await db.query("SELECT * FROM product ORDER BY id DESC");
    let newcollection = result.rows.slice(0, 8);

    console.log("All Date is Fetched succesfully.");
    res.send(newcollection)
})

// Creating end Point for populer for men or women
app.get('/populerinmen', async(req,res) =>{
    const men = 'men';
    const result = await  db.query("SELECT * FROM product WHERE category = ($1) ORDER BY id DESC",[men]);
    const populer = result.rows.slice(0, 4);
    res.send(populer);
})
// creating middle ware to fetch use 
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors: "Please authenticate using valid token"})
    }else{
        try{
            const data = jwt.verify(token, "secret_ecom");
            req.user = data.user;
            next();
        }catch(error){
            res.status(401).send({errors: "Please authenticate using valid token"})
        }
    }
}
// Creating endpoint to add product to cart
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        const user = req.user.id;
        const itemId = req.body.itemId;

        // Check if the product exists
        const product = await db.query("SELECT * FROM product WHERE id = $1", [itemId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check if the item is already in the cart
        const cartItem = await db.query(
            "SELECT * FROM cartitem WHERE product_id = $1 AND user_id = $2",
            [itemId, user]
        );

        if (cartItem.rows.length === 0) {
            // Add the item to the cart
            await db.query("INSERT INTO cartitem (product_id, user_id, quantity) VALUES ($1, $2, 1)", [itemId, user]);
        } else {
            // Increment the quantity
            await db.query(
                "UPDATE cartitem SET quantity = quantity + 1 WHERE product_id = $1 AND user_id = $2",
                [itemId, user]
            );
        }

        return res.json({ success: true, message: "Item added to cart" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Creating endpoint to remove product from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        const user = req.user.id;
        const itemId = req.body.itemId;

        // Check if the item exists in the cart
        const cartItem = await db.query(
            "SELECT * FROM cartitem WHERE product_id = $1 AND user_id = $2",
            [itemId, user]
        );

        if (cartItem.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        // Decrement the quantity or remove the item if the quantity is 1
        if (cartItem.rows[0].quantity > 1) {
            await db.query(
                "UPDATE cartitem SET quantity = quantity - 1 WHERE product_id = $1 AND user_id = $2",
                [itemId, user]
            );
        } else {
            await db.query("DELETE FROM cartitem WHERE product_id = $1 AND user_id = $2", [itemId, user]);
        }

        return res.json({ success: true, message: "Item removed from cart" });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



// Endpoint to get cart data
app.get('/getcart', fetchUser, async (req, res) => {
    try {
        console.log("Fetching Cart Data");
        const result = await db.query(
            "SELECT product_id, quantity FROM cartitem WHERE user_id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching cart data:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// Creating API For Order
app.post('/addorder', async(req,res) => {
    const {fullName, payment, location, product_id,  category, price} = req.body;

    const result = await db.query(
        "INSERT INTO orders (fullName,  user_location, payment_methods, category, product , price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [fullName,  location, payment, category, product_id, price]
    );

    res.json({
        success: true,
        name: req.body.fullName,
    })    
})

// End Point For Orders
app.get('/getorder', async(req, res) => {
    const result = await db.query('SELECT * FROM orders');
    console.log(result.rows)
    res.send(result.rows)
})

// To start the Server
app.listen(port, (error) => {
    if(!error){
        console.log(`Server is running on ${port}. `)
    }
    else{
        console.log("Error: " + error)
    }
})
