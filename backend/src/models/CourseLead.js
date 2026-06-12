import mongoose from "mongoose";
import { leadSchema } from "./Lead.js";

const CourseLead = mongoose.model("CourseLead", leadSchema, "course_leads");

export default CourseLead;
