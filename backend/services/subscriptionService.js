const stripe = require("./stripeService");
const { Plan, Subscription } = require("../models");


const createCheckoutSession = async ({ user, subscriptionPlanId }) => {
  const plan = await Plan.findByPk(subscriptionPlanId);

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  if (!plan.isActive) {
    throw new Error("This subscription plan is not active");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    customer_email: user.email,

    line_items: [
      {
        price_data: {
          currency: "inr",

          product_data: {
            name: plan.name,
            description: plan.description || undefined,
          },

          unit_amount: Math.round(Number(plan.price) * 100),
        },

        quantity: 1,
      },
    ],

    metadata: {
      userId: String(user.id),
      subscriptionPlanId: String(plan.id),
    },

    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  return session;
};

const getCurrentSubscription = async (userId) => {
  const subscription = await Subscription.findOne({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: [
      {
        model: Plan,
        as: "plan",
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return subscription;
}

const getSubscriptionHistory = async (userId) => {
  const subscriptions = await Subscription.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: Plan,
        as: "plan",
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return subscriptions;
};
module.exports = {
  createCheckoutSession,
   getCurrentSubscription,
   getSubscriptionHistory,
};