const Product = require('../models/product');

const ErrorHandler = require("../utils/errorHandler");
const APIFeatures = require("../utils/apiFeatures");
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const cloudinary = require('cloudinary')
const csv = require('csvtojson')

exports.importProducts = async (req, res, next) => {
    try {
        csv()
            .fromFile(req.file.path)
            .then((jsonObj) => {

                for (let i = 0; i < jsonObj.length; i++) {
                    // console.log(jsonObj[i]);
                    saveProducts(jsonObj[i], req)
                }
            })



    } catch (error) {
        res.send(
            {
                status: 400,
                success: false,
                message: error.message
            }
        )

    }
    res.status(200).json({
        success: true,
        message: "Api working "
    })

}

const saveProducts = async (prod, req) => {
    // prod.user = req.user.id;
    prod.user = "643d09122dcc8c8060b3015e";
    const product = await Product.create(prod);


}















exports.newProduct = catchAsyncErrors(async (req, res, next) => {

    let images = [];


    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }
    let imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
        })

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }
    let pwp = JSON.parse(req.body.productWeightPrice)
    pwp.forEach((itm) => {
        pwp.weight = parseFloat(itm.weight);
        pwp.price = parseFloat(itm.price);
        pwp.units = itm.units;
        pwp.quantity = parseInt(itm.quantity);
        pwp.size = itm.size;

    })
    req.body.productWeightPrice = pwp;
    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
})

//Get all products/api/v1/products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 8;
    const productsCount = await Product.countDocuments();
    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resPerPage);
    const products = await apiFeatures.query;
    res.status(200).json({
        success: true,
        count: products.length,
        productsCount,
        resPerPage,
        products
    })
})

//Get all admin products WITHOUT PAGINATION
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const productsCount = await Product.countDocuments();
    const products = await Product.find();
    res.status(200).json({
        success: true,
        productsCount,
        products
    })
})
//update  product/api/v1/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));

    }
    let images = [];
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }
    if (images !== undefined) {

        //Deleting product images as well
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)

        }
        let imagesLinks = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products'
            })

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }
        req.body.images = imagesLinks;
       

    }
    console.log(req.body);
    let pwp = JSON.parse(req.body.productWeightPrice)
    pwp.forEach((itm) => {
        pwp.weight = parseFloat(itm.weight);
        pwp.price = parseFloat(itm.price);
        pwp.units = itm.units;
        pwp.quantity = parseInt(itm.quantity);
        pwp.size = itm.size;

    })
    req.body.productWeightPrice = pwp;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(201).json({
        success: true,
        product
    })

})
//Get all products/api/v1/product/:id
exports.getProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(201).json({
        success: true,
        product
    })
})

//Delete  product/api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));

    }
    //Deleting product images as well
    for (let i = 0; i < product.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)

    }
    await product.deleteOne();

    res.status(201).json({
        success: true,

        message: "product is deleted"
    })

})
//////////////////////////-------- Reviews Section ----------//////////////////////////////////////

//Create/Update   review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString())

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating
            }
        })

    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length

    }
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    await product.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true
    })
});
//Get product reviews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews

    })
})


//Delete review => /api/v1/review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {


    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(r => r.id.toString() !== req.query.id.toString())
    const numOfReviews = reviews.length
    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews

    }, {
        new: true,
        runValidators: true
    })


    res.status(200).json({
        success: true
    })
});