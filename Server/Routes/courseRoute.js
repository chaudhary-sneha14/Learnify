import express from "express";
import {getAllCourse, getCourseById } from "../Controller/courseController.js";

const courseRouter = express.Router()

courseRouter.get('/all', getAllCourse);
courseRouter.get('/:id', getCourseById);

export default courseRouter;