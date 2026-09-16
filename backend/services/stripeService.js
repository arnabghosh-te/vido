const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
    const account = await stripe.accounts.retrieve();
})();

module.exports = stripe;