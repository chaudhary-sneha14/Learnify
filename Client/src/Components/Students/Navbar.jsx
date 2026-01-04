import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { NavLink, useLocation } from 'react-router-dom'
import { UserButton, useUser, useClerk } from '@clerk/clerk-react'
import { AppContext } from '../../Context/AppContext'

const Navbar = () => {

  const {navigate,isEducator}=useContext(AppContext)

  // Gives access to the current URL path
  const location = useLocation()

  // Used to change navbar background on course list pages
  const isCourseListPage = location.pathname.includes('/course-list')

  // Clerk function to open sign-in modal
  const { openSignIn } = useClerk()

  // Logged-in user object (null if not authenticated)
  const { user } = useUser()

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 
      border-b border-gray-500 py-3 
      ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}
    >
      {/* App logo */}
      <img onClick={()=>navigate('/')}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {/* Show these links only when user is logged in */}
          {user && (
            <>
              <button onClick={()=>{navigate('/educator')}}>
                 {isEducator?'Educator Dashboard':'Become Educator'}</button>
              <NavLink to="/my-enrollments">My Enrollments</NavLink>
            </>
          )}
        </div>

        {/* If user is logged in show profile button, else show sign-up */}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Create Account
          </button>
        )}
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          {/* Same links for mobile, shown only when logged in */}
          {user && (
            <>
             <button onClick={()=>{navigate('/educator')}}>
                 {isEducator?'Educator Dashboard':'Become Educator'}</button>
              <NavLink to="/my-enrollments">My Enrollments</NavLink>
            </>
          )}
        </div>

        {/* User icon or Clerk profile button for mobile */}
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="User Icon" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
