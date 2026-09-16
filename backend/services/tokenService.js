const { Subscription, TokenTransaction, Notification } = require("../models");
const sequelize = require("../config/database");

const deductTokens = async (userId, amount, referenceType, referenceId, description) => {
  const transaction = await sequelize.transaction();
  try {
    const subscription = await Subscription.findOne({
      where: { userId, status: "ACTIVE" },
      transaction,
    });

    if (!subscription) {
      throw new Error("Active subscription not found for user.");
    }

    if (subscription.remainingTokens < amount) {
      amount = subscription.remainingTokens; // Deduct whatever is left
    }

    subscription.remainingTokens -= amount;
    subscription.usedTokens += amount;
    await subscription.save({ transaction });

    await TokenTransaction.create(
      {
        userId,
        subscriptionId: subscription.id,
        type: "DEBIT",
        amount,
        balanceAfter: subscription.remainingTokens,
        referenceType,
        referenceId,
        description,
      },
      { transaction }
    );

    await transaction.commit();
    return subscription.remainingTokens;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const notifyLowToken = async (userId, remainingTokens) => {
  await Notification.create({
    userId,
    title: "Low Token Warning",
    message: `You have ${remainingTokens} tokens remaining. Please recharge soon to avoid call interruptions.`,
    type: "LOW_TOKEN",
    isRead: false,
  });
};

module.exports = {
  deductTokens,
  notifyLowToken,
};
