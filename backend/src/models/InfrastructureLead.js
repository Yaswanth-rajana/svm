import mongoose from "mongoose";
import { leadSchema } from "./Lead.js";

const InfrastructureLead = mongoose.model("InfrastructureLead", leadSchema, "infrastructure_leads");

export default InfrastructureLead;
