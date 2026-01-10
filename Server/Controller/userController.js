import Stripe from "stripe";
import Course from "../Model/Course.js";
import { Purchase } from "../Model/Purchase.js";
import User from "../Model/User.js";
import { CourseProgress } from "../Model/CourseProgress.js";


//-------------------------------- Get users data-------------------------------------------
export const getUserData = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)
        if(!user){
            res.json({success: false, message:"User not found!"})
        }

        res.json({success: true, user});
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

//---------------------- User enrolled course with lecture link-----------------

export const userEnrolledCourses = async (req,res)=>{
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success:true, enrolledCourses: userData.enrolledCourses})


    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


// Purchase course

export const purchaseCourse = async (req,res) => {
    try {
        const {courseId} = req.body
        const {origin} = req.headers
        const userId = req.auth.userId;

        const userData=await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData || !courseData)
        {
            res.json({success: false, message: "Data Not Found"})
        }

        const purchaseData={
            courseId:courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

         const newPurchase = await Purchase.create(purchaseData);

        // stripe gateway initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase();

         // creating line items to for stripe
        const line_items = [{
            price_data:{
                currency,
                product_data:{
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor( newPurchase.amount ) * 100
            },
            quantity: 1
        }]

        const session=await stripeInstance.checkout.sessions.create({
            success_url:`${origin}/loading/my-enrollments`,
            cancel_url:`${origin}/`,
            line_items:line_items,
            mode:'payment',
            metadata:{
                purchaseId: newPurchase._id.toString(),
                // userId: userId.toString(),
                // courseId: courseData._id.toString()
            }
        })
          res.json({success: true, session_url: session.url})
    }
    catch(error){
        res.json({success: false, message:error.message})

    }
}


//--------------------------- Update user Course progress--------------------------------------

export const updateUserCourseProgress = async (req, res) => {
  try {
    // Get logged-in user id from auth middleware
    const userId = req.auth.userId;

    // Get course and lecture ids from request body
    const { courseId, lectureId } = req.body;

    // Check if progress record already exists for this user and course
    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      // If lecture already marked as completed, do nothing
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: "Lecture Already Completed" });
      }

      // Add lecture to completed list
      progressData.lectureCompleted.push(lectureId);

      // Mark course as completed (your logic sets it true once any lecture is done)
      progressData.completed = true;

      // Save updated progress
      await progressData.save();
    } else {
      // Create new progress record if not found
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    // Send success response
    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------get user course progress----------------------------

export const getUserCourseProgress = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})
        res.json({success: true, progressData})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


// ---------------Add user ratings to course------------------------------------

export const addUserRating = async (req, res) => {
  try {
    // Get logged-in user id from auth middleware
    const userId = req.auth.userId;

    // Get course id and rating from request body
    const { courseId, rating } = req.body;

    // Validate input values
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Invalid details" });
    }

    // Find the course in database
    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course Not found!" });
    }

    // Find user in database
    const user = await User.findById(userId);

    // Check if user has purchased/enrolled in this course
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User has not purchased this course.",
      });
    }

    // Check if user already rated this course
    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId === userId
    );

    if (existingRatingIndex > -1) { //rating availabel
      // Update existing rating
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating entry
      course.courseRatings.push({ userId, rating });
    }

    // Save updated course ratings
    await course.save();

    // Send success response
    res.json({ success: true, message: "Rating Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
