const subscriptionService = require("../services/subscriptionService");

const createCheckoutSession = async (req, res, next) => {
  try {
    const { subscriptionPlanId } = req.body;

    if (!subscriptionPlanId) {
      return res.status(422).json({
        success: false,
        message: "subscriptionPlanId is required",
      });
    }

    const session = await subscriptionService.createCheckoutSession({
      user: req.user,
      subscriptionPlanId,
    });

    return res.status(200).json({
      success: true,
      message: "Checkout session created successfully",
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentSubscription = async (req, res, next) => {
  try {
    const subscription =
      await subscriptionService.getCurrentSubscription(req.user.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current subscription fetched successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

const getSubscriptionHistory = async (req, res, next) => {
  try {
    const subscriptions =
      await subscriptionService.getSubscriptionHistory(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Subscription history fetched successfully",
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  getCurrentSubscription,
  getSubscriptionHistory,
};