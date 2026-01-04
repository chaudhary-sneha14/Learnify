import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext'
import SearchBar from '../../Components/Students/SearchBar'
import { useParams } from 'react-router-dom'
import CourseCard from '../../Components/Students/CourseCard'
import { assets } from '../../assets/assets'
import Footer from '../../Components/Students/Footer'

const CoursesList = () => {

  const { navigate, allCourses } = useContext(AppContext)

  const { input } = useParams()

  // State to store filtered courses
  const [filteredCourse, setFilteredcourse] = useState([])

  // Runs whenever allCourses or input changes
  useEffect(() => {

    // Check if courses exist
    if (allCourses && allCourses.length > 0) {

      // Create a shallow copy of courses array
      const tempCourse = allCourses.slice()

      // If search input exists, filter courses by title
      input
        ? setFilteredcourse(
            tempCourse.filter(item =>
              item.courseTitle.toLowerCase().includes(input.toLowerCase())
            )
          )
        // Otherwise show all courses
        : setFilteredcourse(tempCourse)
    }

  }, [allCourses, input])

  return (
    <>
      {/* Main container */}
      <div className="relative md:px-36 px-8 pt-20 text-left">

        {/* Header section */}
        <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">

          {/* Title and breadcrumb */}
          <div>
            <h1 className="text-4xl font-semibold text-gray-800">
              Course List
            </h1>

            <p className="text-gray-500">
              {/* Navigate to home */}
              <span
                onClick={() => navigate('/')}
                className="text-blue-600 cursor-pointer"
              >
                Home
              </span>
              {' '} / {' '}
              <span>Course List</span>
            </p>
          </div>

          {/* Search bar */}
          <SearchBar data={input} />
        </div>

        {/* Search tag shown only when input exists */}
        {input && (
          <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600">
            <p>{input}</p>

            {/* Clear search and navigate back */}
            <img
              src={assets.cross_icon}
              className="cursor-pointer"
              onClick={() => navigate('/course-list')}
              alt=""
            />
          </div>
        )}

        {/* Courses grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0">

          {/* Render course cards */}
          {filteredCourse.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}

        </div>
      </div>
      <Footer/>
    </>
  )
}

export default CoursesList
