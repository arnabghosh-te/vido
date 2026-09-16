const stripe = require("../services/stripeService");
const { User, Plan, Subscription } = require("../models");

const handleStripeWebhook = async (req, res) => {
  console.log("========== STRIPE WEBHOOK RECEIVED ==========");

  const signature = req.headers["stripe-signature"];

  console.log("Stripe signature received:", !!signature);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error.message,
    );

    return res.status(400).json({
      success: false,
      message: "Invalid Stripe webhook signature",
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.userId;
      const subscriptionPlanId = session.metadata?.subscriptionPlanId;

      if (!userId || !subscriptionPlanId) {
        console.error("Missing Stripe metadata");

        return res.status(400).json({
          success: false,
          message: "Missing checkout metadata",
        });
      }

      const user = await User.findByPk(userId);
      const plan = await Plan.findByPk(subscriptionPlanId);

      if (!user || !plan) {
        console.error("User or subscription plan not found");

        return res.status(404).json({
          success: false,
          message: "User or subscription plan not found",
        });
      }

      // Prevent duplicate subscription creation
      const existingSubscription = await Subscription.findOne({
        where: {
          stripeCheckoutSessionId: session.id,
        },
      });

      if (existingSubscription) {
        return res.status(200).json({
          success: true,
          message: "Webhook already processed",
        });
      }

      // Rollover tokens from any previous active subscriptions
      const previousSubscriptions = await Subscription.findAll({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
      });

      let rolloverTokens = 0;
      for (const sub of previousSubscriptions) {
        rolloverTokens += sub.remainingTokens;
        // Mark old subscription as UPGRADED so it's no longer the active one
        sub.status = "UPGRADED";
        await sub.save();
      }

      const startDate = new Date();

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationInDays);

      const totalTokens = plan.tokensIncluded + rolloverTokens;

      const subscription = await Subscription.create({
        userId: user.id,
        subscriptionPlanId: plan.id,

        startDate,
        endDate,

        allocatedTokens: totalTokens,
        remainingTokens: totalTokens,
        usedTokens: 0,

        status: "ACTIVE",

        stripeCustomerId: session.customer || null,

        stripeCheckoutSessionId: session.id,

        stripePaymentIntentId: session.payment_intent || null,
      });

      console.log(`Subscription ${subscription.id} created successfully`);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  handleStripeWebhook,
};
