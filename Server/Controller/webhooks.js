import { Webhook } from "svix";
import Stripe from "stripe";
import User from "../Model/User.js";
import Course from "../Model/Course.js";
import { Purchase } from "../Model/Purchase.js";

/* =========================
   CLERK WEBHOOK (UNCHANGED)
   ========================= */

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
        await User.create({
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        });
        break;
      }

      case "user.updated": {
        await User.findByIdAndUpdate(data.id, {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }

      default:
        break;
    }

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   STRIPE WEBHOOK (FIXED)
   ========================= */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  console.log("🔔 STRIPE WEBHOOK HIT");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Stripe Event:", event.type);

  /* ✅ CORRECT EVENT FOR CHECKOUT PAYMENTS */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      console.log("Session Metadata:", session.metadata);

      const { purchaseId, userId, courseId } = session.metadata;

      // fetch purchase
      const purchase = await Purchase.findById(purchaseId);
      if (!purchase || purchase.status === "completed") {
        return res.json({ received: true });
      }

      // fetch user & course
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      if (!user || !course) {
        console.error("❌ User or Course not found");
        return res.json({ received: true });
      }

      // add student to course
      if (!course.enrolledStudents.includes(user._id)) {
        course.enrolledStudents.push(user._id);
        await course.save();
      }

      // add course to user
      if (!user.enrolledCourses.includes(course._id)) {
        user.enrolledCourses.push(course._id);
        await user.save();
      }

      // update purchase status
      purchase.status = "completed";
      await purchase.save();

      console.log("✅ MongoDB updated successfully");
    } catch (error) {
      console.error("❌ Webhook DB error:", error);
    }
  }

  res.json({ received: true });
};
