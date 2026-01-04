import React, { useContext } from "react";
import { assets } from "../../assets/assets"; // Import icons and images

import { Link } from "react-router-dom"; // Used for navigation
import { AppContext } from "../../Context/AppContext"; // Global context

// CourseCard component displays a single course card
const CourseCard = ({ course }) => {

  // Get currency symbol and rating calculator from context
  const { currency, calculateRating } = useContext(AppContext);

  return (
    // Clicking the card navigates to the course details page
    <Link
      to={"/course/" + course._id}
      onClick={() => scrollTo(0, 0)} // Scroll to top on navigation
      className="border border-gray-500/30 pb-6 overflow-hidden rounded-lg"
    >
      {/* Course thumbnail image */}
      <img
        className="w-full"
        src={course.courseThumbnail}
        alt="courseThumbnail"
      />

      <div className="p-3 text-left">
        {/* Course title */}
        <h3 className="text-base font-semibold">{course.courseTitle}</h3>

        {/* Rating section */}
        <div className="flex items-center space-x-2">
          {/* Numeric average rating */}
          <p>{calculateRating(course)}</p>

          {/* Star rating display */}
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                className="w-3.5 h-3.5"
                key={i}
                // Shows filled stars based on the course rating,
                // remaining stars are shown as empty
                src={
                  i < Math.floor(calculateRating(course))
                    ? assets.star
                    : assets.star_blank
                }
                alt="star"
              />
            ))}
          </div>

          {/* Total number of review */}
          <p className="text-gray-500">{course.courseRatings.length}</p>
        </div>

        {/* Course price after applying discount */}
        <p className="text-base font-semibold text-gray-800">
          {currency}{" "}
          {(
            course.coursePrice -
            (course.discount * course.coursePrice) / 100
          ).toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default CourseCard;
