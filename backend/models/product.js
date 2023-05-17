const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Length cannot be more than 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product name'],
        maxLength: [5, 'Length cannot be more than 5 characters'],
        default: 0.0
    },
    productWeightPrice: [
        {
            weight: { type: Number, required: false },
            size: { type: String, required: false },
            unit: { type: Number, required: false },
            qty: { type: Number, required: false },
            price: { type: Number, required: false }
        }
    ],
    description: {
        type: String,
        required: [true, 'Please enter product description']

    },
    ratings: {
        type: Number,
        default: 0.0

    },
    images: [
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please enter product category'],
        enum: {
            values: [
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes',
                'Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message: "Please select correct category"
        }


    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [5, 'Length cannot be more than 5 characters'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true

            },
            name: {
                type: String,
                required: true

            },
            rating: {
                type: Number,
                required: true

            },
            comment: {
                type: String,
                required: true

            }
        }

    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true

    },
    createdAt: {
        type: Date,
        default: Date.now()
    }


})
module.exports = mongoose.model('Product', productSchema);