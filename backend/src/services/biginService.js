import axios from "axios";
import { getBiginAccessToken } from "./biginAuthService.js";

// Memory cache for layout metadata
let cachedLayoutId = null;
let cachedSubPipelineValue = null;
let cachedFields = null;

// Program display mapping (from MongoDB key to expected Bigin Display Value)
const PROGRAM_DISPLAY_MAP = {
  "it-infrastructure": "IT Infrastructure",
  "cloud-computing": "Cloud Computing",
  "devops-engineering": "DevOps Engineering",
  "virtualization-engineering": "Virtualization Engineering",
  "server-engineering": "Server Engineering",
  "storage-engineering": "Storage Engineering",
  "backup-engineering": "Backup Engineering"
};

/**
 * @desc    Clean and format phone number to exactly 10 digits for Bigin
 */
const cleanPhoneForBigin = (phone) => {
  if (!phone) return "";
  // Strip any non-digit character
  const digits = phone.replace(/\D/g, "");
  // If it starts with 91 and is 12 digits, strip the 91 country code
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  // Otherwise, if it's longer than 10, slice the last 10 digits
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
};

/**
 * @desc    Helper to extract duplicate record ID from Bigin API error
 */
const extractDuplicateId = (error) => {
  const data = error.response?.data?.data?.[0];
  if (!data) return null;

  // Case 1: Direct DUPLICATE_DATA
  if (data.code === "DUPLICATE_DATA" && data.details?.duplicate_record?.id) {
    return data.details.duplicate_record.id;
  }

  // Case 2: MULTIPLE_OR_MULTI_ERRORS
  if (data.code === "MULTIPLE_OR_MULTI_ERRORS" && data.details?.errors) {
    for (const subErr of data.details.errors) {
      if (subErr.code === "DUPLICATE_DATA" && subErr.details?.duplicate_record?.id) {
        return subErr.details.duplicate_record.id;
      }
    }
  }

  return null;
};

/**
 * @desc    Fetch and cache layout configurations & field schemas from Bigin
 */
export const getBiginMetadataConfig = async () => {
  if (cachedLayoutId && cachedSubPipelineValue && cachedFields) {
    return {
      layoutId: cachedLayoutId,
      subPipeline: cachedSubPipelineValue,
      fields: cachedFields
    };
  }

  try {
    const accessToken = await getBiginAccessToken();

    // 1. Fetch Layouts to discover SMVEN Training Programs layout ID
    const layoutsRes = await axios.get("https://www.zohoapis.in/bigin/v2/settings/layouts?module=Pipelines", {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });

    const layouts = layoutsRes.data.layouts || layoutsRes.data.data || [];
    const targetLayout = layouts.find(l => 
      l.name?.toLowerCase() === "smven training programs" ||
      l.display_label?.toLowerCase() === "smven training programs"
    );
    if (targetLayout) {
      cachedLayoutId = targetLayout.id;
      console.log(`✅ Cached Layout ID: ${cachedLayoutId} (${targetLayout.name})`);
    }

    // 2. Fetch Fields metadata to resolve Sub_Pipeline value and for picklist resolving
    const fieldsRes = await axios.get("https://www.zohoapis.in/bigin/v2/settings/fields?module=Pipelines", {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });
    cachedFields = fieldsRes.data.fields || fieldsRes.data.data || [];

    const subPipelineField = cachedFields.find(f => f.api_name === "Sub_Pipeline");
    if (subPipelineField && subPipelineField.pick_list_values) {
      const spVal = subPipelineField.pick_list_values.find(v => 
        v.actual_value?.toLowerCase() === "smven training programs standard" ||
        v.display_value?.toLowerCase() === "smven training programs standard" ||
        v.actual_value?.toLowerCase().startsWith("smven training programs") ||
        v.display_value?.toLowerCase().startsWith("smven training programs")
      );
      if (spVal) {
        cachedSubPipelineValue = spVal.actual_value;
        console.log(`✅ Cached Sub-Pipeline value: "${cachedSubPipelineValue}"`);
      }
    }
  } catch (error) {
    console.error("⚠️ Failed to dynamically fetch Bigin metadata config:", error.response?.data || error.message);
  }

  // Fallbacks
  if (!cachedSubPipelineValue) {
    cachedSubPipelineValue = "SMVEN Training Programs Standard";
  }

  return {
    layoutId: cachedLayoutId,
    subPipeline: cachedSubPipelineValue,
    fields: cachedFields || []
  };
};

/**
 * @desc    Helper to resolve the picklist actual_value dynamically by display label
 */
const resolveProgramValue = (mongoProgram, fieldsList) => {
  const targetDisplay = PROGRAM_DISPLAY_MAP[mongoProgram] || mongoProgram;
  
  const programField = fieldsList.find(f => f.api_name === "Program");
  if (programField && programField.pick_list_values) {
    const matchedValue = programField.pick_list_values.find(v => 
      v.display_value?.toLowerCase() === targetDisplay.toLowerCase() ||
      v.actual_value?.toLowerCase() === targetDisplay.toLowerCase()
    );
    if (matchedValue) {
      return matchedValue.actual_value;
    }
  }
  return targetDisplay;
};

/**
 * @desc    Helper to map experience text to closest picklist actual_value
 */
const resolveExperienceValue = (exp) => {
  if (!exp) return "-None-";
  const lower = exp.toLowerCase();
  if (lower.includes("fresher") || lower.startsWith("0")) return "Fresher";
  if (lower.includes("1-3") || lower.startsWith("1") || lower.startsWith("2")) return "1-3 Years";
  if (lower.includes("3-5") || lower.startsWith("3") || lower.startsWith("4")) return "3-5 Years";
  if (lower.includes("5+") || lower.startsWith("5") || lower.startsWith("6") || lower.startsWith("7") || lower.startsWith("8") || lower.startsWith("9")) return "5+ Years";
  return "-None-";
};

/**
 * @desc    Helper to update fields of a pipeline record in Zoho Bigin
 */
const updateBiginRecord = async (biginRecordId, fields) => {
  const accessToken = await getBiginAccessToken();
  const response = await axios.put(
    "https://www.zohoapis.in/bigin/v2/Pipelines",
    { data: [{ id: biginRecordId, ...fields }] },
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (response.data && response.data.data && response.data.data[0]) {
    const resDetail = response.data.data[0];
    if (resDetail.status === "error") {
      throw new Error(resDetail.message || "Failed to update record in Bigin");
    }
  }
  return response.data;
};

/**
 * @desc    Create a registration record in Zoho Bigin Pipelines module
 * @param   {Object} lead - Lead document from MongoDB
 * @returns {Promise<string>} Created Bigin Record ID
 */
export const createRegistrationInBigin = async (lead) => {
  const accessToken = await getBiginAccessToken();
  const { layoutId, subPipeline, fields } = await getBiginMetadataConfig();

  // Resolve values dynamically
  const resolvedProgram = resolveProgramValue(lead.program, fields);
  const resolvedExperience = resolveExperienceValue(lead.experience);

  // Map stage, payment status, and certificate claimed status dynamically based on current lead state
  let stage = "New Enquiry";
  let paymentStatus = "Pending";

  if (lead.paymentStatus === "paid") {
    stage = "Enrolled";
    paymentStatus = "Paid";
  } else if (lead.paymentStatus === "refunded") {
    paymentStatus = "Refunded";
  }

  const record = {
    Deal_Name: lead.name,
    Phone: cleanPhoneForBigin(lead.phone),
    Email: lead.email,
    Program: resolvedProgram,
    Working_Profile: lead.workingProfile || "N/A",
    Experience: resolvedExperience,
    Payment_Status: paymentStatus,
    Stage: stage,
    Sub_Pipeline: subPipeline,
    Certificate_Claimed: !!lead.certificateClaimed
  };

  if (layoutId) {
    record.Pipeline = { id: layoutId };
  }

  console.log(`🆕 Creating Bigin registration for: ${lead.email} - Payload:`, record);

  try {
    const response = await axios.post(
      "https://www.zohoapis.in/bigin/v2/Pipelines",
      { data: [record] },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data && response.data.data && response.data.data[0]) {
      const resDetail = response.data.data[0];
      if (resDetail.status === "success" && resDetail.details?.id) {
        console.log(`✅ Bigin registration created: ${resDetail.details.id}`);
        return resDetail.details.id;
      } else {
        throw new Error(resDetail.message || "Failed to create record in Bigin");
      }
    }
    throw new Error("No record details returned from Zoho Bigin API");
  } catch (error) {
    // Check if the failure is due to DUPLICATE_DATA
    const duplicateId = extractDuplicateId(error);
    if (duplicateId) {
      console.log(`ℹ️ Duplicate record found in Zoho Bigin. Reusing existing ID: ${duplicateId}. Updating its fields...`);
      try {
        const updateFields = {
          Payment_Status: paymentStatus,
          Stage: stage,
          Certificate_Claimed: !!lead.certificateClaimed
        };
        await updateBiginRecord(duplicateId, updateFields);
      } catch (updErr) {
        console.error(`⚠️ Failed to update duplicate record ${duplicateId} fields:`, updErr.message);
      }
      return duplicateId;
    }
    throw error;
  }
};

/**
 * @desc    Update record Stage in Zoho Bigin
 */
export const updateRegistrationStage = async (biginRecordId, stageName) => {
  console.log(`🔄 Updating Bigin record ${biginRecordId} stage to: ${stageName}`);
  return updateBiginRecord(biginRecordId, { Stage: stageName });
};

/**
 * @desc    Update record Payment Status in Zoho Bigin
 */
export const updatePaymentStatus = async (biginRecordId, status) => {
  // Normalize status values to match Bigin picklist options: Pending, Paid, Refunded
  let biginStatus = "Pending";
  if (status?.toLowerCase() === "paid") {
    biginStatus = "Paid";
  } else if (status?.toLowerCase() === "refunded") {
    biginStatus = "Refunded";
  }

  console.log(`🔄 Updating Bigin record ${biginRecordId} payment status to: ${biginStatus}`);
  return updateBiginRecord(biginRecordId, { Payment_Status: biginStatus });
};

/**
 * @desc    Update record Student Status in Zoho Bigin
 */
export const updateStudentStatus = async (biginRecordId, status) => {
  // Normalize status values to match Bigin picklist options: Active Student, Alumni
  let biginStatus = "-None-";
  if (status === "Active Student") {
    biginStatus = "Active Student";
  } else if (status === "Alumni") {
    biginStatus = "Alumni";
  }

  console.log(`🔄 Updating Bigin record ${biginRecordId} student status to: ${biginStatus}`);
  return updateBiginRecord(biginRecordId, { Student_Status: biginStatus });
};

/**
 * @desc    Update record Certificate Claimed status in Zoho Bigin (Boolean)
 */
export const updateCertificateClaimed = async (biginRecordId, claimed) => {
  console.log(`🔄 Updating Bigin record ${biginRecordId} certificate claimed to: ${!!claimed}`);
  return updateBiginRecord(biginRecordId, { Certificate_Claimed: !!claimed });
};
