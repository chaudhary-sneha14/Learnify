import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import { AppContext } from "../../Context/AppContext";
import Footer from "../../Components/Students/Footer";
import Loading from "../../Components/Students/Loading";

const CourseDetails = () => {
  // Get course ID from URL
  const { id } = useParams();

  // State variables
  const [courseData, setCourseData] = useState(null); // Stores course info
  const [openSections, setOpenSections] = useState({}); // Tracks which sections are expanded
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false); // Check if user enrolled
  const [playerData, setPlayerData] = useState(null); // Stores video player data

  // Get functions from context
  const {
    allCourses,
    currency,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
  } = useContext(AppContext);

  // Fetch course data from all courses array
  const fetcheCourseData = async () => {
    if (!allCourses) return;
    const findCourse = allCourses.find((course) => course._id === id);
    setCourseData(findCourse || null);
  };

  // Toggle chapter expansion
  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Enroll button handler
  const enrollCourse = () => {
    console.log();
    ("Enroll functionality not implemented yet!");
  };

  // Fetch course data when component loads or ID changes
  useEffect(() => {
    fetcheCourseData();
  }, [allCourses, id]);

  // Show loading if course not found, otherwise show details
  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 pt-20 text-left">
        {/* Gradient background */}
        <div className="absolute top-0 left-0 w-full h-section-height -z-10 bg-gradient-to-b from-cyan-100/70"></div>

        {/* LEFT COLUMN - Course Info */}
        <div className="max-w-xl z-10 text-gray-500">
          {/* Course title */}
          <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>

          {/* Course description preview */}
          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 200),
            }}
          />

          {/* Rating and student count */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>
            {/* Star rating display */}
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  className="w-3.5 h-3.5"
                  key={i}
                  src={
                    i < Math.floor(calculateRating(courseData))
                      ? assets.star
                      : assets.star_blank
                  }
                  alt="star"
                />
              ))}
            </div>
            {/* Number of ratings */}
            <p className="text-blue-600">
              ({courseData.courseRatings.length}{" "}
              {courseData.courseRatings.length > 1 ? "ratings" : "rating"})
            </p>
            {/* Number of enrolled students */}
            <p>
              {courseData.enrolledStudents.length}{" "}
              {courseData.enrolledStudents.length > 1 ? "students" : "student"}
            </p>
          </div>

          {/* Educator name */}
          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">{courseData.educator.name}</span>
          </p>

          {/* Course structure - expandable chapters */}
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  className="border border-gray-300 bg-white mb-2 rounded"
                  key={index}
                >
                  {/* Chapter header - clickable to expand */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Dropdown arrow */}
                      <img
                        className={`transform transition-transform ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                        src={assets.down_arrow_icon}
                        alt="down_arrow_icon"
                      />
                      {/* Chapter title */}
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    {/* Lecture count and duration */}
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  {/* Expandable lectures list */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          {/* Play icon */}
                          <img
                            onClick={() =>
                              setPlayerData({
                                videoId: lecture.lectureUrl.split("/").pop(),
                              })
                            }
                            className="w-4 h-4 mt-1 cursor-pointer"
                            src={assets.play_icon}
                            alt="play_icon"
                          />
                          {/* Lecture title, preview button, duration */}
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {/* Preview button (if available) */}
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: lecture.lectureUrl.split("/").pop(),
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Preview
                                </p>
                              )}
                              {/* Lecture duration */}
                              <p>
                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                  units: ["h", "m"],
                                })}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full course description */}
          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription,
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN - Course Card */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {/* Video player or course thumbnail */}
          {playerData ? (
            <YouTube
              videoId={playerData.videoId}
              opts={{ playerVars: { autoplay: 1 }, origin: window.location.origin, }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="courseThumbnail" />
          )}

          <div className="p-5">
            {/* Limited time offer alert */}
            <div className="flex items-center gap-2">
              <img className="w-3.5" src={assets.time_left_clock_icon} alt="time_left_clock_icon" />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>

            {/* Price display with discount */}
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}{" "}
                {(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency} {courseData.coursePrice}{" "}
              </p>
              <p className="md:text-lg text-gray-500">{currency} {courseData.discount}% off</p>
            </div>

            {/* Course stats - rating, duration, lessons */}
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>

              {/* Divider */}
              <div className="h-4 w-px bg-gray-500/40"></div>

              {/* Total course duration */}
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="time_clock_icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              {/* Divider */}
              <div className="h-4 w-px bg-gray-500/40"></div>

              {/* Number of lessons */}
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lesson_icon" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
            </div>

            {/* Enroll button */}
            <div>
              {isAlreadyEnrolled ? (
                <p className="md:mt-6 mt-4 w-full py-3 rounded text-center bg-blue-600 text-white font-medium">
                  Already Enrolled
                </p>
              ) : (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100 === 0) ? (
                <p className="md:mt-6 mt-4 w-full py-3 rounded text-center bg-blue-600 text-white font-medium">Free</p>
              ) : (
                <button onClick={enrollCourse} className="md:mt-6 mt-4 w-full py-3 rounded text-center bg-blue-600 text-white font-medium">
                  Enroll Now
                </button>
              )}
            </div>

            {/* Course benefits list */}
            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-gray-800">
                What's in the course?
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  ) : (
    // Show loading spinner while fetching
    <Loading />
  );
};

export default CourseDetails;