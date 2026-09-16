const express = require("express");

const router = express.Router();

const {createCheckoutSession,getCurrentSubscription,getSubscriptionHistory} = require("../controllers/subscriptionController");

const {authenticate,authorizeUser} = require("../middleware/auth");

router.post("/checkout",authenticate,authorizeUser,createCheckoutSession);
router.get("/current", authenticate, authorizeUser, getCurrentSubscription);
router.get("/history", authenticate, authorizeUser, getSubscriptionHistory);

module.exports = router;