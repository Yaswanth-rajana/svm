import InfrastructureLead from "../models/InfrastructureLead.js";
import CourseLead from "../models/CourseLead.js";

const INFRA_PROGRAMS = ["it-infrastructure"];

/**
 * Returns the mongoose model corresponding to the given program.
 * @param {string} program
 * @returns {mongoose.Model}
 */
export default function getLeadModel(program) {
  return INFRA_PROGRAMS.includes(program) ? InfrastructureLead : CourseLead;
}
