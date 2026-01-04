import React, { useEffect, useState } from 'react'

const Rating = ({ initialRating, onRate }) => {

  // state to store how many stars are selected
  // if initialRating is not given, start from 0
  const [rating, setRating] = useState(initialRating || 0)

  // function runs when a star is clicked
  const handleRating = (value) => {
    setRating(value)          // update the selected rating
    if (onRate) onRate(value) // send rating value to parent component
  }

  // keep rating in sync if parent updates initialRating
  useEffect(() => {
    if (initialRating) {
      setRating(initialRating) // update rating when prop changes
    }
  }, [initialRating])          // run effect when initialRating changes

  return (
    <div>
      {/* loop to create 5 stars */}
      {Array.from({ length: 5 }, (_, index) => {

        // starValue represents star number (1 to 5)
        const starValue = index + 1

        return (
          <span
            key={index} // unique key for each star

            // if star number is less than or equal to rating → yellow
            // otherwise → gray
            className={`text-xl sm:text-2xl cursor-pointer transition-colors 
              ${starValue <= rating ? 'text-yellow-500' : 'text-gray-400'}`}

            // when user clicks star, update rating
            onClick={() => handleRating(starValue)}
          >
            &#9733; {/* star symbol */}
          </span>
        )
      })}
    </div>
  )
}

export default Rating
