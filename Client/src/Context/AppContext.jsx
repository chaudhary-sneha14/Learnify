
import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

// Create global App Context
export const AppContext = createContext();

export const AppContextProvider = (props) => {

  // Currency from environment variables
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();

  // State to store all courses
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // State to check if user is educator
  const [isEducator, setIsEducator] = useState(true);

  // -------------------- Fetch all courses --------------------
  const fetchAllCourses = async () => {
    // Currently using dummy data
    setAllCourses(dummyCourses);
  };

  // -------------------- Calculate average course rating --------------------
  const calculateRating = (course) => {

    // If no ratings exist, return 0
    if (course.courseRatings.length === 0) {
      return 0;
    }

    let totalRating = 0;

    // Sum all rating values
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });

    // Return average rating
    return totalRating / course.courseRatings.length;
  };

  // -------------------- Calculate total time of a chapter --------------------
  const calculateChapterTime = (chapter) => {
    let time = 0;

    // Add duration of each lecture
    chapter.chapterContent.map(
      (lecture) => (time += lecture.lectureDuration)
    );

    // Convert minutes to human readable format
    return humanizeDuration(time * 60 * 1000, {
      units: ["h", "m"],
    });
  };

  // -------------------- Calculate total course duration --------------------
  const calculateCourseDuration = (chapter) => {
    let time = 0;

    // Loop through all chapters and lectures
    chapter.courseContent.map((chapter) =>
      chapter.chapterContent.map(
        (lecture) => (time += lecture.lectureDuration)
      )
    );

    // Convert minutes to human readable format
    return humanizeDuration(time * 60 * 1000, {
      units: ["h", "m"],
    });
  };

  // -------------------- Calculate total number of lectures --------------------
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;

    // Count lectures from each chapter
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });

    return totalLectures;
  };

  //-----------------------------fetch user  enrolled course----------------------
  const fetchUserEnrolledCourses=()=>{
    setEnrolledCourses(dummyCourses)
  }
  // Fetch courses once on app load
  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourses();
  }, []);

  // Values exposed to the entire app
  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    enrolledCourses,
    setEnrolledCourses,
    fetchUserEnrolledCourses
  };

  // Provide context to children components
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
