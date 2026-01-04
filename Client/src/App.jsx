import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import Home from './pages/Students/Home'
import CoursesList from './pages/Students/CoursesList'
import CourseDetails from './pages/Students/CourseDetails'
import MyEnrollments from './pages/Students/MyEnrollments'
import Player from './pages/Students/Player'
import Loading from './Components/Students/Loading'
import Educator from './pages/Educator/Educator'
import Dashboard from './pages/Educator/Dashboard'
import AddCourse from './pages/Educator/AddCourse'
import MyCourses from './pages/Educator/MyCourses'
import StudentsEnrolled from './pages/Educator/StudentsEnrolled'
import Navbar from './Components/Students/Navbar'
import "quill/dist/quill.snow.css"

const App = () => {

   const isEducatorRoute=useMatch('/educator/*') 
  return (
    <div className='text-default min-h-screen bg-white'>
      {!isEducatorRoute && <Navbar/> }
      
      <Routes>
       <Route path='/' element ={<Home/>}/>
       <Route path='/course-list' element ={<CoursesList/>}/>
       <Route path='/course-list/:input' element ={<CoursesList/>}/>
       <Route path='/course/:id' element ={<CourseDetails/>}/>
       <Route path='/my-enrollments' element ={<MyEnrollments/>}/>
       <Route path='/player/:courseId' element ={<Player/>}/>
       <Route path='/Loading/:path' element ={<Loading/>}/>
       <Route path='/educator' element={<Educator/>}>
       <Route index element={<Dashboard/>}/>
       <Route path='add-course' element={<AddCourse/>}/>
       <Route path='my-course' element={<MyCourses/>}/>
       <Route path='student-enrolled' element ={<StudentsEnrolled/>}/>
       </Route>

      </Routes>
    </div>
  )
}

export default App
