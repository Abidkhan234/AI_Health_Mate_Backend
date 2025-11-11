import express from 'express'
import userRoute from './user.route.js';
import reportRoute from './report.route.js';

const mainRoute = express.Router();

mainRoute.use("/auth", userRoute);

mainRoute.use("/report", reportRoute)

export default mainRoute;