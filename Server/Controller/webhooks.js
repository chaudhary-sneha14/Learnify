import { Webhook } from "svix";
import User from "../Model/User.js";
import Stripe from "stripe";
import { Purchase } from "../Model/Purchase.js";
import Course from "../Model/Course.js";

// ================= CLERK WEBHOOK (UNCHANGED) =================

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= STRIPE WEBHOOK (FIXED) =================

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ SUCCESS HANDLER (MINIMAL FIX)
  const handleCheckoutSuccess = async (session) => {
    try {
      const { purchaseId, userId, courseId } = session.metadata;

      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData || purchaseData.status === "completed") return;

      const userData = await User.findById(userId);
      const courseData = await Course.findById(courseId);

      if (!userData || !courseData) return;

      if (!courseData.enrolledStudents.includes(userData._id)) {
        courseData.enrolledStudents.push(userData._id);
        await courseData.save();
      }

      if (!userData.enrolledCourses.includes(courseData._id)) {
        userData.enrolledCourses.push(courseData._id);
        await userData.save();
      }

      purchaseData.status = "completed";
      await purchaseData.save();
    } catch (error) {
      console.error("Error handling checkout success:", error);
    }
  };

  switch (event.type) {
    // ❌ REMOVED payment_intent.succeeded
    // ✅ ADDED checkout.session.completed
    case "checkout.session.completed":
      await handleCheckoutSuccess(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
};
