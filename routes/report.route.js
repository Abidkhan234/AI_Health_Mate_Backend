import express from 'express'
import { addReport, deleteReport, getAllReports, getSingleReport, updateReport } from '../controllers/report.controller.js';
import protectedRoute from '../middlewares/protectedRoutes.js';
import { checkDailyLimit } from '../middlewares/rateLimiters.js';
import upload from '../middlewares/multerMiddleware.js';

const reportRoute = express.Router();

reportRoute.post("/upload-report", protectedRoute, upload.single("file"), addReport);

reportRoute.get("/", protectedRoute, getAllReports);

reportRoute.get("/:id", protectedRoute, getSingleReport);

reportRoute.delete("/delete-report/:id", protectedRoute, deleteReport);

reportRoute.put("/update-report/:id", protectedRoute, upload.single("file"), updateReport);

export default reportRoute;