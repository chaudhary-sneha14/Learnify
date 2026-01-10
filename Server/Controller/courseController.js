

// ----------------------------get all courses----------------------------------

import Course from "../Model/Course.js";

export const getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator" });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// ----------------------get course by id--------------------
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseData = await Course.findById(id).populate({ path: "educator" });

    // Remove lecture Url if previewFrese is false

    
    courseData.courseContent.forEach((chapter) => {   // Loop through each chapter of the course
      chapter.chapterContent.forEach((lecture) => {      // Loop through each lecture inside the chapter
        // (means only enrolled users should access it)
        if (!lecture.isPreviewFree) {                       // Check if this lecture is NOT free for preview
                                                         // cannot watch or access paid lecture content
          lecture.lectureUrl = "";                       // // Remove the lecture URL so non-enrolled users
        }
      });
    });

    res.json({ success: true, courseData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
