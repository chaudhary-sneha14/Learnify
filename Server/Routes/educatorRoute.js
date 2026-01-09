import express from 'express'
import { addCourse, getEducatorCourses, getEnrolledStudentData, updateRoleToEducator } from '../Controller/educatorController.js'
import upload from '../Config/multer.js'
import { protectEducator } from '../Middleware/authmiddleware.js'

const educatorRouter = express.Router()

educatorRouter.get('/update-role',updateRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse);
educatorRouter.get('/courses', protectEducator, getEducatorCourses);
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentData);

export default educatorRouter