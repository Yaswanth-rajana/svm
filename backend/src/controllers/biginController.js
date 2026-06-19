import axios from "axios";
import { getBiginAccessToken } from "../services/biginAuthService.js";
import InfrastructureLead from "../models/InfrastructureLead.js";
import CourseLead from "../models/CourseLead.js";
import { createRegistrationInBigin } from "../services/biginService.js";

/**
 * @desc    Test connection to Zoho Bigin using CurrentUser API
 * @route   GET /api/bigin/test-connection
 */
export const testBiginConnection = async (req, res) => {
  try {
    const accessToken = await getBiginAccessToken();
    
    // Log token generated successfully (temporarily, as requested)
    console.log("Zoho token generated successfully");

    const response = await axios.get("https://www.zohoapis.in/bigin/v2/users?type=CurrentUser", {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`
      }
    });

    return res.status(200).json({
      success: true,
      message: "Zoho Bigin connection successful",
      user: response.data
    });
  } catch (error) {
    console.error("Bigin Token Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};

/**
 * @desc    Get Zoho Bigin Layouts and Fields metadata for debugging
 * @route   GET /api/bigin/debug-metadata
 */
export const getBiginMetadata = async (req, res) => {
  try {
    const accessToken = await getBiginAccessToken();

    const layoutsPromise = axios.get("https://www.zohoapis.in/bigin/v2/settings/layouts?module=Pipelines", {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });

    const fieldsPromise = axios.get("https://www.zohoapis.in/bigin/v2/settings/fields?module=Pipelines", {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });

    const [layoutsRes, fieldsRes] = await Promise.all([layoutsPromise, fieldsPromise]);

    return res.status(200).json({
      success: true,
      layouts: layoutsRes.data,
      fields: fieldsRes.data
    });
  } catch (error) {
    console.error("Bigin Metadata Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};

/**
 * @desc    Test creating a registration in the "SMVEN Training Programs" pipeline
 * @route   POST /api/bigin/test-create-registration
 */
export const testCreateRegistration = async (req, res) => {
  try {
    const accessToken = await getBiginAccessToken();

    // 1. Fetch layouts to discover Layout ID (Pipeline lookup field in API v2)
    const layoutsRes = await axios.get("https://www.zohoapis.in/bigin/v2/settings/layouts?module=Pipelines", {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });

    const layouts = layoutsRes.data.layouts || layoutsRes.data.data || [];
    const targetLayout = layouts.find(l => 
      l.name?.toLowerCase() === "smven training programs" ||
      l.display_label?.toLowerCase() === "smven training programs"
    );
    const layoutId = targetLayout?.id;

    if (layoutId) {
      console.log(`Found target layout: ${targetLayout.name} (ID: ${layoutId})`);
    } else {
      console.warn("SMVEN Training Programs layout not found. Default layout will be used by Zoho.");
    }

    // 2. Fetch fields metadata to discover Sub_Pipeline values and mapped stages
    const fieldsRes = await axios.get("https://www.zohoapis.in/bigin/v2/settings/fields?module=Pipelines", {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });
    const fields = fieldsRes.data.fields || fieldsRes.data.data || [];

    const subPipelineField = fields.find(f => f.api_name === "Sub_Pipeline");
    let targetSubPipelineValue = null;
    let targetStageValue = null;

    if (subPipelineField && subPipelineField.pick_list_values) {
      // Find picklist value matching "SMVEN Training Programs Standard"
      const spVal = subPipelineField.pick_list_values.find(v => 
        v.actual_value?.toLowerCase() === "smven training programs standard" ||
        v.display_value?.toLowerCase() === "smven training programs standard" ||
        v.actual_value?.toLowerCase().startsWith("smven training programs") ||
        v.display_value?.toLowerCase().startsWith("smven training programs")
      );

      if (spVal) {
        targetSubPipelineValue = spVal.actual_value;
        console.log(`Found target sub-pipeline: "${targetSubPipelineValue}"`);

        // Discover the first stage mapping
        const stageMap = spVal.maps?.find(m => m.api_name === "Stage");
        if (stageMap && stageMap.pick_list_values && stageMap.pick_list_values.length > 0) {
          targetStageValue = stageMap.pick_list_values[0].actual_value;
          console.log(`Selected first stage: "${targetStageValue}"`);
        }
      }
    }

    // Fallbacks if not resolved dynamically
    if (!targetSubPipelineValue) {
      targetSubPipelineValue = "SMVEN Training Programs Standard";
      console.warn(`Could not resolve sub-pipeline value. Falling back to default: "${targetSubPipelineValue}"`);
    }
    if (!targetStageValue) {
      targetStageValue = "New Enquiry";
      console.warn(`Could not resolve stage value. Falling back to default: "${targetStageValue}"`);
    }

    // 3. Prepare payload
    const uniqueSuffix = Date.now().toString().slice(-4);
    const record = {
      Deal_Name: `API Test Registration ${uniqueSuffix}`, // Standard primary name field
      Registration_Name: `API Test Registration ${uniqueSuffix}`, // Fallback for UI layouts renaming Deal_Name
      Phone: `999999${uniqueSuffix}`, // maximum length of 10
      Email: `apitest+${uniqueSuffix}@smven.com`,
      Sub_Pipeline: targetSubPipelineValue,
      Stage: targetStageValue
    };

    if (layoutId) {
      record.Pipeline = { id: layoutId }; // Layout ID must be passed as an object under the "Pipeline" API name
    }

    console.log("Sending record creation payload to Zoho Bigin:", record);

    // 4. Create the record in Pipelines module
    const createRes = await axios.post(
      "https://www.zohoapis.in/bigin/v2/Pipelines",
      { data: [record] },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Test registration created successfully",
      data: createRes.data
    });
  } catch (error) {
    console.error("Bigin Create Registration Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};

/**
 * @desc    Resync all failed registrations to Zoho Bigin
 * @route   POST /api/bigin/resync-failed
 */
export const resyncFailedLeads = async (req, res) => {
  try {
    const query = {
      biginSyncStatus: "failed",
      $or: [
        { biginRetryCount: { $lt: 10 } },
        { biginRetryCount: { $exists: false } }
      ]
    };

    const infraLeads = await InfrastructureLead.find(query).limit(50);
    const courseLeads = await CourseLead.find(query).limit(50);
    const allLeads = [...infraLeads, ...courseLeads];

    console.log(`🔄 Resyncing ${allLeads.length} failed leads to Zoho Bigin...`);

    let successCount = 0;
    let failureCount = 0;
    const details = [];

    for (const lead of allLeads) {
      lead.lastBiginRetryAt = new Date();
      lead.biginRetryCount = (lead.biginRetryCount || 0) + 1;

      try {
        console.log(`🔄 Retrying sync for lead: ${lead.email}`);
        const biginRecordId = await createRegistrationInBigin(lead);
        lead.biginRecordId = biginRecordId;
        lead.biginSyncStatus = "synced";
        lead.lastBiginSyncAt = new Date();
        lead.biginLastError = undefined; // clear error
        await lead.save();
        successCount++;
        details.push({ email: lead.email, status: "success", biginRecordId });
      } catch (err) {
        console.error(`❌ Failed to resync lead ${lead.email}:`, err.response?.data || err.message);
        lead.biginLastError = err.message;
        await lead.save();
        failureCount++;
        details.push({ email: lead.email, status: "failed", error: err.response?.data || err.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Resync complete. Success: ${successCount}, Failed: ${failureCount}`,
      details
    });
  } catch (error) {
    console.error("❌ Error resyncing failed leads:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

/**
 * @desc    Get Zoho Bigin sync stats (synced, failed, pending, total counts)
 * @route   GET /api/bigin/stats
 */
export const getBiginStats = async (req, res) => {
  try {
    const models = [InfrastructureLead, CourseLead];
    let synced = 0;
    let failed = 0;
    let pending = 0;

    for (const Model of models) {
      synced += await Model.countDocuments({ biginSyncStatus: "synced" });
      failed += await Model.countDocuments({ biginSyncStatus: "failed" });
      pending += await Model.countDocuments({ biginSyncStatus: "pending" });
    }

    const total = synced + failed + pending;

    return res.status(200).json({
      success: true,
      stats: {
        synced,
        failed,
        pending,
        total
      }
    });
  } catch (error) {
    console.error("❌ Error fetching Bigin stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

