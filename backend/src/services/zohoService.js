import axios from "axios";

let cachedToken = null;
let tokenExpiry = null;

/**
 * @desc    Get Zoho Access Token using Refresh Token (with memory caching)
 * @returns {Promise<string>} Access Token
 */
export const getZohoAccessToken = async () => {
  try {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log("✅ Using cached Zoho access token");
      return cachedToken;
    }

    console.log("🔄 Fetching new Zoho access token...");
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

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + 55 * 60 * 1000; // Cache for 55 minutes

    console.log("✅ Zoho access token generated successfully");
    return cachedToken;
  } catch (error) {
    console.error("❌ Failed to generate Zoho access token:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * @desc    Create or Update Lead in Zoho CRM (Program-specific check)
 * @param   {Object} leadData - Lead data from MongoDB
 */
export const sendLeadToZohoCRM = async (leadData) => {
  try {
    const accessToken = await getZohoAccessToken();

    // Map Registration Status logic
    let registrationStatus = "Payment Pending";
    if (leadData.paymentStatus === "paid") {
      registrationStatus = "Paid";
    }
    if (leadData.certificateClaimed) {
      registrationStatus = "Certificate Claimed";
    }

    // Map Payment Status logic (supported: pending, paid, refunded)
    let zohoPaymentStatus = "pending";
    if (leadData.paymentStatus === "paid") {
      zohoPaymentStatus = "paid";
    } else if (leadData.paymentStatus === "refunded") {
      zohoPaymentStatus = "refunded";
    }

    // Map Certificate Status logic (supported: Claimed, Not Claimed)
    const certificateStatus = leadData.certificateClaimed ? "Claimed" : "Not Claimed";

    // Format eventDate to YYYY-MM-DD
    const formatDate = (dateVal) => {
      if (!dateVal) return null;
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
    };

    // Map leadData to Zoho fields
    const zohoLead = {
      Last_Name: leadData.name,
      Email: leadData.email,
      Phone: leadData.phone,
      Lead_Source: leadData.sources?.join(", ") || "Webinar",
      Working_Profile: leadData.workingProfile || "N/A",
      Experience: leadData.experience || "N/A",
      Description: `Registration Date: ${leadData.createdAt}\nPayment Status: ${leadData.paymentStatus}\nProgram: ${leadData.program || "it-infrastructure"}`,
      
      // Mapped fields
      Program: leadData.program || "it-infrastructure",
      Registration_Status: registrationStatus,
      Payment_Status: zohoPaymentStatus,
      Webinar_Date: formatDate(leadData.eventDate),
      Certification_Status: certificateStatus,
      Amount_Paid: leadData.amountPaid || 0
    };

    // Search for existing lead in Zoho matching the email
    let existingLeadId = null;
    try {
      const searchResponse = await axios.get(
        `https://www.zohoapis.in/crm/v2/Leads/search?criteria=(Email:equals:${encodeURIComponent(leadData.email)})`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );

      if (searchResponse.data && searchResponse.data.data) {
        const leads = searchResponse.data.data;
        const matchingLead = leads.find((l) => {
          const apiProgram = l.Program;
          const desc = l.Description || "";
          const targetProgram = leadData.program || "it-infrastructure";

          // Match by Program field if present in Zoho response
          if (apiProgram && apiProgram.toLowerCase() === targetProgram.toLowerCase()) {
            return true;
          }

          // Fallback: Match by Program identifier in Description
          if (desc.includes(`Program: ${targetProgram}`)) {
            return true;
          }

          return false;
        });

        if (matchingLead) {
          existingLeadId = matchingLead.id;
          console.log(`✅ Found matching Zoho Lead ID: ${existingLeadId} for email: ${leadData.email} and program: ${leadData.program}`);
        }
      }
    } catch (searchErr) {
      console.log(`ℹ️ Zoho search criteria returned info:`, searchErr.response?.data || searchErr.message);
    }

    let response;
    if (existingLeadId) {
      // Update existing Zoho Lead
      zohoLead.id = existingLeadId;
      console.log(`🔄 Syncing: Updating Zoho Lead ${existingLeadId} for ${leadData.email}`);
      response = await axios.put(
        "https://www.zohoapis.in/crm/v2/Leads",
        { data: [zohoLead] },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // Create a new Zoho Lead
      console.log(`🆕 Syncing: Creating new Zoho Lead for ${leadData.email} (Program: ${leadData.program})`);
      response = await axios.post(
        "https://www.zohoapis.in/crm/v2/Leads",
        { data: [zohoLead] },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (response.data && response.data.data && response.data.data[0]) {
      const result = response.data.data[0];
      if (result.status === "success") {
        console.log(`✅ Lead synced successfully to Zoho: ${leadData.email} (Program: ${leadData.program}) - Action: ${result.action}`);
      } else {
        console.error(`⚠️ Zoho sync warning for ${leadData.email}:`, result.message || result.code);
      }
    }

    return response.data;
  } catch (error) {
    console.error("❌ Zoho CRM sync failed:", error.response?.data || error.message);
  }
};
