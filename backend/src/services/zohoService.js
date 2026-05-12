import axios from "axios";

/**
 * @desc    Get Zoho Access Token using Refresh Token
 * @returns {Promise<string>} Access Token
 */
export const getZohoAccessToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append("refresh_token", process.env.ZOHO_REFRESH_TOKEN);
    params.append("client_id", process.env.ZOHO_CLIENT_ID);
    params.append("client_secret", process.env.ZOHO_CLIENT_SECRET);
    params.append("grant_type", "refresh_token");

    const response = await axios.post("https://accounts.zoho.in/oauth/v2/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("✅ Zoho access token generated successfully");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to generate Zoho access token:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * @desc    Create or Update Lead in Zoho CRM
 * @param   {Object} leadData - Lead data from MongoDB
 */
export const sendLeadToZohoCRM = async (leadData) => {
  try {
    const accessToken = await getZohoAccessToken();

    // Map leadData to Zoho fields
    // NOTE: 'Last_Name' is a mandatory field in Zoho CRM
    // Custom field API names (Payment_Status, Working_Profile, Experience) should match Zoho API Names
    const zohoLead = {
      Last_Name: leadData.name,
      Email: leadData.email,
      Phone: leadData.phone,
      Lead_Source: leadData.sources?.join(", ") || "Webinar",
      Payment_Status: leadData.paymentStatus || "pending",
      Working_Profile: leadData.workingProfile || "N/A",
      Experience: leadData.experience || "N/A",
      Description: `Registration Date: ${leadData.createdAt}\nPayment Status: ${leadData.paymentStatus}`,
    };

    const payload = {
      data: [zohoLead],
      duplicate_check_fields: ["Email"],
    };

    console.log("🚀 Zoho payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      "https://www.zohoapis.in/crm/v2/Leads/upsert",
      payload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.data && response.data.data[0]) {
      const result = response.data.data[0];
      if (result.status === "success") {
        if (result.code === "SUCCESS") {
          console.log(`✅ Lead synced successfully to Zoho: ${leadData.email}`);
        } else if (result.code === "DUPLICATE_DATA" || result.action === "update") {
          console.log(`ℹ️ Lead updated in Zoho (Duplicate handled): ${leadData.email}`);
        }
      } else {
        console.error(`⚠️ Zoho sync warning for ${leadData.email}:`, result.message || result.code);
      }
    }

    return response.data;
  } catch (error) {
    console.error("❌ Zoho CRM sync failed:", error.response?.data || error.message);
    // Fail-safe: We don't throw the error so the main application flow (payment/registration) isn't broken
  }
};
