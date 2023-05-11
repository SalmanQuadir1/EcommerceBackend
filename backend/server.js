const app = require('./app');
const connectDatabase = require('./config/database')
const dotenv = require('dotenv');
const cloudinary = require('cloudinary')
//Handle uncaught exceptions:
process.on('uncaughtException', err => {
    console.log(`Error :${err.stack}`);
    console.log("Shutting down server due to uncaught Exception ");

    process.exit(1);


})
dotenv.config({ path: 'backend/config/config.env' });
connectDatabase();


//Setting up cloudinary config 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started at: ${process.env.PORT} in ${process.env.NODE_ENV} mode`)
})

//Handle unhandled Promise rejections
process.on('unhandledRejection', err => {
    console.log(`Error :${err.stack}`);
    console.log("Shutting down server due to unhandled promise rejection");
    server.close(() => {
        process.exit(1);
    }
    )

})
