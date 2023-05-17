const express = require('express');
const cookieParser = require('cookie-parser');
const bodyparser = require('body-parser')
//const fileupload = require('express-fileupload')
const dotenv = require('dotenv');
const multer = require('multer')
const path = require('path');
const { importProducts } = require('./controllers/productController');

const app = express();

const errorMiddleware = require('./middlewares/error')
dotenv.config({ path: 'backend/config/config.env' });

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.urlencoded({limit:'50mb',extended:true}));
app.use(express.static(path.resolve(__dirname, 'public')));


app.use(cookieParser());
//app.use(fileupload());

//upload products file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file.originalname)
        cb(null,  'backend/public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)

    }
});
var upload = multer({ storage: storage });


//Import all routes
const products = require('./routes/product');
const users = require('./routes/auth');
const payment = require('./routes/payment');
const order = require('./routes/order');



app.use('/api/v1', products);
app.use('/api/v1', users);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.post("/upload", upload.single('file'),importProducts);


app.use(errorMiddleware);

module.exports = app;