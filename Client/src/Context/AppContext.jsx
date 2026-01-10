
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth,useUser} from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from "react-toastify";

// Create global App Context
export const AppContext = createContext();

export const AppContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const {getToken}=useAuth()  //fetches a secure auth token from Clerk to call protected backend APIs.
  const{user}=useUser() //provides the currently logged-in user’s profile and metadata from Clerk.



  // State to store all courses
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);     // State to check if user is educator
  const [userData, setUserData] = useState(null)

  // -------------------- Fetch all courses --------------------
  const fetchAllCourses = async () => {
     try {
            const {data} = await axios.get(backendUrl + '/api/course/all');
            if(data.success)
            {
                setAllCourses(data.courses)
            }else{
                toast.error(data.message);
            }
            
        } catch (error) {
            toast.error(error.message)
        }
  };

    // -----------------------------fetch user data-----------------------------
    const fetchUserData = async ()=>{

        if(user.publicMetadata.role === 'educator'){
            setIsEducator(true);
        }

        try {
            const token = await getToken();

            const {data} = await axios.get(backendUrl + '/api/user/data' , {headers: {Authorization: `Bearer ${token}`}})
        
            if(data.success){
                setUserData(data.user)
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }



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
    return Math.floor(totalRating / course.courseRatings.length);
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
  const fetchUserEnrolledCourses=async()=>{
   try {
            const token = await getToken();
            const {data} = await axios.get(backendUrl + "/api/user/enrolled-courses", {
                headers: { Authorization: `Bearer ${token}` }
            });
    
    
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse());
            } else {
                toast.error(data.message || "No enrolled courses found.");
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error(error.response?.data?.message || error.message);
        }
  }


  // Fetch courses once on app load
  useEffect(() => {
    fetchAllCourses();
  }, []);


  useEffect(()=>{
    if(user){
     fetchUserData()
     fetchUserEnrolledCourses();
    }
  },[user])

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
    fetchUserEnrolledCourses,
    backendUrl,
    fetchUserData,
    setUserData,getToken,fetchAllCourses,userData
  };

  // Provide context to children components
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
