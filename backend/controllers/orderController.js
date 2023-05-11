const Order = require('../models/order');
const Product = require('../models/product');
const client = require('twilio')(process.env.TWILLO_ACCOUNT_SID, process.env.TWILLO_AUTH_TOKEN);


const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })
    res.status(200).json({
        success: true,
        order
    })
})

//Get Single Order api/v1/order/:id
exports.getOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new ErrorHandler(`No order found with id:${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        order
    })

})

//Get logged in user Orders api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id });
    if (!orders) {
        return next(new ErrorHandler(`No order found `))
    }
    console.log(orders);
    res.status(200).json({
        success: true,
        orders
    })

})
//Get all Orders => api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })

})

//Get update Process Order - Admin => api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler(`You have already delivered this order`))

    }
    order.orderItems.forEach(async item => {
        await updateStock(item.id, item.quantity)

    })
    order.orderStatus = req.body.status,
        order.deliveredAt = Date.now();

    //Twillo Messaging Code 
    try {
        const message = await client.messages.create({
            body: `Your order ${order._id} has been ${req.body.status}`,
            to: `+91${order.shippingInfo.phoneNo}`,
            from: '+12705454595',
        });
        console.log(message);
    } catch (error) {

        console.error(error);
    }

    await order.save();

    res.status(200).json({
        success: true,
        order
    })

})

async function updateStock(id, quantity) {

    const product = await Product.findById(id);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false });
}

//Delete Order api/v1/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler(`No order found with id:${req.params.id}`, 400))

    }
    await order.deleteOne();
    res.status(200).json({
        success: true,
        message: "Your order is Deleted"
    })

})