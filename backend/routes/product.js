const express = require('express');
const router = express.Router()


const { getProducts, newProduct, getProduct, updateProduct, deleteProduct, 
     createProductReview, getProductReviews, deleteReview, getAdminProducts } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// authorizeRoles('admin'), --------- for admin routes
router.route('/products').get(getProducts);
router.route('/product/:id').get(getProduct);

router.route('/admin/product/new').post(isAuthenticatedUser, newProduct);
router.route('/admin/products').get(isAuthenticatedUser, getAdminProducts);
router.route('/admin/product/:id').put( isAuthenticatedUser, updateProduct);
router.route('/admin/product/:id').delete( isAuthenticatedUser, deleteProduct);

router.route('/review').put( isAuthenticatedUser, createProductReview);
router.route('/reviews').get( isAuthenticatedUser, getProductReviews);
router.route('/reviews').delete( isAuthenticatedUser, deleteReview);

module.exports = router;