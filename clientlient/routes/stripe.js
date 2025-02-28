const express = require('express');
const router = express.Router();
const StripeControler = require('../controllers/StripeController');

//! Testing
router.use(express.json());

// Send Notification Middleware
const {
    addVisualAsNotification,
    sendEmailAsNotification,
} = require("../middleware/notification.js");

//const validateHTTP = require("../middleware/httpRequest.js");
const validateToken = require("../middleware/accountVerify.js");
// const validate = require('../middleware/validate.js');

//1 Get Product List
router.get('/GetProduct', StripeControler.GetProduct);
router.get('/GetProduct/:id', StripeControler.GetProductByID);

//2 Create Customer
router.get('/GetCustomer', StripeControler.GetCustomer);
router.post('/CreateCustomerRetrieve', StripeControler.CreateCustomerRetrieve);

//3 Create Subscription
router.post('/create-checkout-session', validateToken, StripeControler.CreatePaymetMethod);
router.post('/CreateSubscription', validateToken, StripeControler.CreateSubscription);

// 4 Invoce And Billing
router.post('/CreateBilling', validateToken, StripeControler.CreateBilling);
router.get('/CreateInvoice', validateToken, StripeControler.CreateInvoice);
router.post('/Subscriptionlist', validateToken, StripeControler.Subscriptionlist);

router.post('/ActiveSubscriptionlist', validateToken, StripeControler.ActiveSubscriptionlist);
router.get('/ActiveSubscription/Student/:id', validateToken, StripeControler.StudentActiveSubscription);


//5 Update Subscription Qty
router.post('/UpdateQty', validateToken, StripeControler.UpdateQty);
router.post('/PauseSubscription', validateToken, StripeControler.PauseSubscription);

//6 cancel subsription immediately / PeriodEnd
router.post('/SubscriptionCancel', validateToken, StripeControler.SubscriptionCancel, sendEmailAsNotification);

router.post('/create-session-id', validateToken, StripeControler.checkOutWithDiscount);

router.get('/GetProductCompany', StripeControler.GetProductCompany);
router.get('/getInvoiceDetails', StripeControler.generateInvoice);
router.get('/getAllProductList', StripeControler.getAllStripeSubscriptions);


module.exports = router;
