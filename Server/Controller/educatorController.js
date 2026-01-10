import {clerkClient} from '@clerk/express' //This gives server-side access to Clerk users.
import Course from '../Model/Course.js'
import User from '../Model/User.js'
import {v2 as cloudinary} from 'cloudinary'
import { Purchase } from '../Model/Purchase.js'


 // Update role to educator
export const updateRoleToEducator = async (req,res)=>{
    try {
        const userId = req.auth.userId //req.auth is added by Clerk auth middleware

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata:{ //publicMetadata (visible to frontend)
                role: 'educator',
            }
        })

        res.json({success: true, message: 'You can publish a course now'})


    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

//---------------------------------Add new Course----------------------------------------------

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        // console.log(educatorId);

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail Not Attached" });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;

        // Upload image first
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        // Create course after ensuring image is uploaded
        const newCourse = await Course.create(parsedCourseData);
        await newCourse.save()

        res.json({ success: true, message: "Course Added", course: newCourse });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// Get educator courses

export const getEducatorCourses = async(req,res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        res.json({success: true, courses})
        
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


//---------- get educatore dashboard data (ttal earnings, enrolled students, No. of courses)-----
export const educatorDashboardData = async (req, res) => {
  try {
    // Get logged-in educator ID
    const educator = req.auth.userId;

    // Get all courses created by this educator
    const courses = await Course.find({ educator });

    // Count total courses
    const totalCourses = courses.length;

    // Get all course IDs
    const courseIds = courses.map(course => course._id);

    // Get completed purchases for these courses
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed"
    });

    // Calculate total earnings from purchases
    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    // Store enrolled students with course title
    const enrolledStudentsData = [];

    // Loop through each course
    for (const course of courses) {

      // Get students enrolled in this course
      const students = await User.find(
        { _id: { $in: course.enrolledStudents } },
        "name imageUrl"
      );

      // Add course title with each student
      students.forEach(student => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student
        });
      });
    }

    // Send dashboard data to frontend
    res.json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses
      }
    });

  } catch (error) {
    // Handle any error
    res.json({ success: false, message: error.message });
  }
};


//------------------------- all students who enrolled in the educator’s courses,---------------
//------------------------  along with the course name and enrollment date.-------
export const getEnrolledStudentData = async (req, res) => {
  try {

    // Get the logged-in educator's user ID
    const educator = req.auth.userId;

    // Find all courses created by this educator
    const courses = await Course.find({ educator });

    // Extract only the course IDs
    const courseIds = courses.map(course => course._id);

    // Find completed purchases for these courses
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed"
    })
      // Get student name and image instead of just user ID
      .populate("userId", "name imageUrl")

      // Get course title instead of just course ID
      .populate("courseId", "courseTitle");

    // Format enrolled students data for frontend use
    const enrolledStudents = purchases.map(purchase => ({
      student: purchase.userId,               // student details
      courseTitle: purchase.courseId.courseTitle, // enrolled course title
      purchaseDate: purchase.createdAt         // enrollment date
    }));

    // Send enrolled students data to frontend
    res.json({ success: true, enrolledStudents });

  } catch (error) {
    // Handle any error
    res.json({ success: false, message: error.message });
  }
};
