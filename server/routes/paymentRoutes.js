import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith("sk_")) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
  console.log(" Stripe initialized");
} else {
  console.warn("Stripe disabled: STRIPE_SECRET_KEY missing or invalid");
}

const DEV_BYPASS = process.env.DEV_BYPASS_AUTH === 'true';

const requireAuth = (req, res, next) => {
  if (DEV_BYPASS) {
    if (!req.session) req.session = {};
    req.session.userId = req.session.userId || 'dev-user';
    return next();
  }
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

router.post("/create-payment-intent", requireAuth, async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: "Stripe not configured" });

    const { amount, currency = "usd" } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: currency.toLowerCase(),
      metadata: {
        userId: user._id.toString(),
        userName: user.name,
        userEmail: user.email,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment intent",
    });
  }
});

router.post("/confirm-payment", requireAuth, async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: "Stripe not configured" });

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const user = await User.findById(req.session.userId);
      if (user) {
        user.subscription = "Premium";
        await user.save();
      }

      res.json({
        success: true,
        message: "Payment successful",
        subscription: "Premium",
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm payment",
    });
  }
});

router.post("/confirm-subscription", requireAuth, async (req, res) => {
  try {
    const { paymentIntentId, planName, amount, firstName, lastName, country } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID required",
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.subscription = "Premium";
    await user.save();

    res.json({
      success: true,
      message: "Subscription updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error("Subscription confirmation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm subscription",
    });
  }
});

router.get("/config", (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update user subscription
        if (paymentIntent.metadata?.userId) {
          try {
            const user = await User.findById(paymentIntent.metadata.userId);
            if (user) {
              user.subscription = "Premium";
              await user.save();
              console.log("User upgraded to Premium:", user.email);
            }
          } catch (error) {
            console.error("Failed to update user subscription:", error);
          }
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
