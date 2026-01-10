import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext'
import Footer from '../../Components/Students/Footer'
import { Line } from 'rc-progress'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyEnrollments = () => {
  // get enrolled courses and helper function from global context
  const { 	navigate,
		enrolledCourses,
		calculateCourseDuration,
		userData,
		fetchUserEnrolledCourses,
		backendUrl,
		getToken,
		calculateNoOfLectures,} = useContext(AppContext)

  // local state to track progress of each enrolled course
  // each object represents completed lectures vs total lectures
  const [progressArray, setProgressArray] = useState([])


//-------------------progress of course-----------------------------
  	const getCourseProgress = async () => {
  try {
    // Get auth token from Clerk
    const token = await getToken();

    // Fetch progress for each enrolled course in parallel
    const tempProgressArray = await Promise.all(
      enrolledCourses.map(async (course) => {
        // Call backend to get progress for this course
        const { data } = await axios.post(
          `${backendUrl}/api/user/get-course-progress`,
          { courseId: course._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Total lectures in this course
        const totalLectures = calculateNoOfLectures(course);

        // Completed lectures (0 if no progress found)
        const lectureCompleted = data.progressData
          ? data.progressData.lectureCompleted.length
          : 0;

        // Return progress summary for this course
        return { totalLectures, lectureCompleted };
      })
    );

    // Store all course progress in state
    setProgressArray(tempProgressArray);
  } catch (error) {
    // Show error if API call fails
    toast.error(error.message);
  }
};



    useEffect(()=>{
    if(userData){
      fetchUserEnrolledCourses();
    }
  },[userData])

  useEffect(()=>{
    if(enrolledCourses.length > 0){
      getCourseProgress();
    }
  },[enrolledCourses])



  return (
    <>
      <div className="md:px-36 px-8 pt-10">
        <h1 className="text-2xl font-semibold">My EnrollMents</h1>

        {/* table to display enrolled course details */}
        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {/* loop through all enrolled courses */}
            {enrolledCourses.map((course, index) => (
              <tr className="border-b border-gray-500/20" key={index}>
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                  
                  {/* course thumbnail */}
                  <img
                    className="w-14 sm:w-24 md:w-28 cursor-pointer"
                    onClick={() => navigate(`/player/${String(course._id)}`)}
                    src={course.courseThumbnail}
                    alt="courseThumbnail"
                  />

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/player/${String(course._id)}`)}
                  >
                    {/* course title */}
                    <p className="mb-1 max-sm:text-sm">{course.courseTitle}</p>

                    {/* progress bar showing course completion percentage */}
                    <Line
                      strokeWidth={2}
                      percent={
                        progressArray[index]
                          ? (progressArray[index].lectureCompleted * 100) /
                            progressArray[index].totalLectures
                          : 0 // fallback if progress data is missing
                      }
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>

                {/* course duration */}
                <td className="px-4 py-3 max-sm:hidden">
                  {calculateCourseDuration(course)}
                </td>

                {/* completed lectures count */}
                <td className="px-4 py-3 max-sm:hidden">
                  {/* show completed/total lectures only if progress data exists */}
                  {progressArray[index] &&
                    `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures}`}
                  <span> Lectures</span>
                </td>

                {/* course status */}
                <td className="px-3 py-3 max-sm:text-right">
                  <button
                    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white"
                    onClick={() => navigate(`/player/${String(course._id)}`)
}
                  >
                    {/* show Completed if all lectures are done, else On Going */}
                    {progressArray[index] &&
                    progressArray[index].lectureCompleted /
                      progressArray[index].totalLectures ===
                      1
                      ? "Completed"
                      : "On Going"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </>
  )
}

export default MyEnrollments
