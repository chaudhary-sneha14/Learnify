import { Webhook } from "svix";
import User from "../Model/User.js";
import Stripe from "stripe";
import { Purchase } from "../Model/Purchase.js";
import Course from "../Model/Course.js";

// ---------------- Clerk Webhook ----------------
// Handles user create, update, delete events from Clerk
export const clerkWebhooks = async (req, res) => {
  try {
    // Create webhook instance using Clerk secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify that the request really came from Clerk
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    // Extract event data and type
    const { data, type } = req.body;

    // Handle different Clerk events
    switch (type) {
      case "user.created": {
        // Build user object from Clerk payload
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        // Save new user in DB
        await User.create(userData);
        return res.json({});
      }

      case "user.updated": {
        // Update existing user details
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        return res.json({});
      }

      case "user.deleted": {
        // Remove user from DB when deleted in Clerk
        await User.findByIdAndDelete(data.id);
        return res.json({});
      }

      default:
        // Ignore unhandled events
        return res.json({});
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Create Stripe instance using secret key
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------- Stripe Webhook ----------------
// Handles payment success and failure events
export const stripeWebhooks = async (request, response) => {
  // Get Stripe signature from headers
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    // Verify Stripe webhook signature
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // Stop if signature is invalid
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process different Stripe events
  switch (event.type) {
    case "payment_intent.succeeded": {
      // Get payment intent id
      const paymentIntentId = event.data.object.id;

      // Find checkout session related to this payment
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      // If no session found, exit safely
      if (!session.data.length) return response.json({ received: true });

      // Get purchaseId stored in metadata
      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) return response.json({ received: true });

      // Load user and course related to purchase
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId);

      if (!userData || !courseData) return response.json({ received: true });

      // Add user to course's enrolled students
      courseData.enrolledStudents.push(userData._id);
      await courseData.save();

      // Add course to user's enrolled courses
      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      // Mark purchase as completed
      purchaseData.status = "completed";
      await purchaseData.save();

      break;
    }

    case "payment_intent.payment_failed": {
      // Get payment intent id
      const paymentIntentId = event.data.object.id;

      // Find related checkout session
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data.length) return response.json({ received: true });

      // Get purchase id from metadata
      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);

      if (!purchaseData) return response.json({ received: true });

      // Mark purchase as failed
      purchaseData.status = "failed";
      await purchaseData.save();
      break;
    }

    default:
      // Log any unhandled Stripe events
      console.log(`Unhandled event type ${event.type}`);
  }

  // Tell Stripe webhook was received successfully
  response.json({ received: true });
};
