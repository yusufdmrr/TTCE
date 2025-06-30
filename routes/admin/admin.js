const express = require('express')
const router = express.Router()
const { inputControllerMiddleware } = require('../../middleware/inputController');
const { upload } = require('../../helpers/multer');
const { setProductInput, updateProductInput, deleteProductInput, addToCartInput, createOrderInput, listOrdersInput, updateOrderStatusInput, getAllProductsInput, registerUserInput, loginUserInput, changePasswordInput, getUserInfoInput, getOrderDetailInput, checkOrderStatusInput, checkStockInput, updateStockInput, setCategoryInput, updateCategoryInput, deleteCategoryInput, getAllCategoriesInput, getProductsByCategoryInput, createPaymentInput, getUserProfileInput, updateUserProfileInput, getUserOrdersInput, guestOrderInput, getUserInput, getOrderByIdInput, createSingleOrderInput, getProductInput } = require('../../controllers/Admin/types');
const { setProduct, updateProduct, deleteProduct, getAllProducts, registerUser, loginUser, changePassword, getUserInfo, addToCart, createOrder, listOrders, updateOrderStatus, getOrderDetail, checkOrderStatus, checkStock, updateStock, setCategory, updateCategory, deleteCategory, getAllCategories, getProductsByCategory, createPayment, paymentCallback, updateUserProfile, getUserProfile, getUserOrders, guestOrder, getUser, getOrderById, getPendingOrders, createSingleOrder, getProduct } = require('../../controllers/Admin/admin');

router.route('/register').post(inputControllerMiddleware(registerUserInput, registerUser, 'post', true));
router.route('/login').post(inputControllerMiddleware(loginUserInput, loginUser, 'post', true));
router.route('/changePassword').post(inputControllerMiddleware(changePasswordInput, changePassword, 'post', true));
router.route('/getUser').post(inputControllerMiddleware(getUserInfoInput, getUserInfo, 'post', true));

router.route('/setProduct').post(upload.single('image'),inputControllerMiddleware(setProductInput, setProduct, 'post', true));
router.route('/updateProduct').post(upload.single('image'),inputControllerMiddleware(updateProductInput, updateProduct, 'post', true));
router.route('/deleteProduct').post(inputControllerMiddleware(deleteProductInput, deleteProduct, 'post', true));
router.route('/getAllProducts').post(inputControllerMiddleware(getAllProductsInput, getAllProducts, 'post', true));
router.route("/getProduct").post(inputControllerMiddleware(getProductInput, getProduct, "post", true));


router.route('/addToCart').post(inputControllerMiddleware(addToCartInput, addToCart, 'post', true));
router.route('/createOrder').post(inputControllerMiddleware(createOrderInput, createOrder, 'post', true));
router.route('/listOrders').post(inputControllerMiddleware(listOrdersInput, listOrders, 'post', true));
router.route('/updateOrderStatus').post(inputControllerMiddleware(updateOrderStatusInput, updateOrderStatus, 'post', true));
router.route('/getOrderDetail').post(inputControllerMiddleware(getOrderDetailInput, getOrderDetail, 'post', true));

router.route('/checkOrderStatus').post(inputControllerMiddleware(checkOrderStatusInput, checkOrderStatus, 'post', true));
router.route('/checkStock').post(inputControllerMiddleware(checkStockInput, checkStock, 'post', true));
router.route('/updateStock').post(inputControllerMiddleware(updateStockInput, updateStock, 'post', true));

router.route('/setCategory').post(inputControllerMiddleware(setCategoryInput, setCategory, 'post', true));
router.route('/updateCategory').post(inputControllerMiddleware(updateCategoryInput, updateCategory, 'post', true));
router.route('/deleteCategory').post(inputControllerMiddleware(deleteCategoryInput, deleteCategory, 'post', true));
router.route('/getAllCategories').post(inputControllerMiddleware(getAllCategoriesInput, getAllCategories, 'post', true));
router.route('/getProductsByCategory').post(inputControllerMiddleware(getProductsByCategoryInput, getProductsByCategory, 'post', true));

router.route('/createPayment').post(inputControllerMiddleware(createPaymentInput, createPayment, 'post', true));
router.route('/paymentCallback').post(paymentCallback);

router.route("/getProfile").post(inputControllerMiddleware(getUserProfileInput, getUserProfile, "post", true));
router.route("/updateProfile").post(inputControllerMiddleware(updateUserProfileInput, updateUserProfile, "post", true));
router.route("/getOrders").post(inputControllerMiddleware(getUserOrdersInput, getUserOrders, "post", true));
router.route('/guestOrder').post(inputControllerMiddleware(guestOrderInput, guestOrder, 'post', true));

router.route("/getUser").post(getUser);
router.route("/getOrderById").post(inputControllerMiddleware(getOrderByIdInput, getOrderById, "post", true));
router.route("/getPendingOrders").post(getPendingOrders);
router.route("/createSingleOrder").post(inputControllerMiddleware(createSingleOrderInput, createSingleOrder, "post", true));


module.exports = router
