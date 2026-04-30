import Lead from "../models/Lead.js";

/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Public
 */
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, workingProfile, experience } = req.body;

    // 2. Check if lead already exists by phone
    let lead = await Lead.findOne({ phone });

    if (lead) {
      // Check if this specific source already exists for this user
      if (lead.sources.includes(source)) {
        console.log("🚫 Duplicate registration for same source:", source);
        return res.status(200).json({
          success: false,
          message: "You have already registered for this",
        });
      }

      // Existing user but NEW source
      console.log("➕ Adding new source to existing user:", source);
      
      // Update other fields if provided
      lead.name = name || lead.name;
      lead.email = email || lead.email;
      if (workingProfile) lead.workingProfile = workingProfile;
      if (experience) lead.experience = experience;
      
      lead.sources.push(source);
      await lead.save();

      return res.status(200).json({
        success: true,
        message: "Your action has been recorded",
        data: lead,
      });
    }

    // 3. Create new Lead (CASE 1)
    console.log("🆕 Creating new lead...");
    lead = await Lead.create({
      name,
      email,
      phone,
      sources: [source],
      workingProfile,
      experience,
    });

    // 4. Return success response
    res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * @desc    Request a call
 * @route   POST /api/request-call
 * @access  Public
 */
export const requestCall = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const source = "call_request";

    // 1. Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and phone",
      });
    }

    console.log("📥 Request Call reached backend:", req.body);

    // 2. Check if lead exists (Upsert logic)
    let lead = await Lead.findOne({ phone });

    if (lead) {
      console.log("✅ Lead found, updating sources to call_request");
      // Add call_request to sources if not already present
      if (!lead.sources.includes(source)) {
        lead.sources.push(source);
      }
      await lead.save();
    } else {
      console.log("🆕 Creating new call request lead");
      // Create new lead
      lead = await Lead.create({
        name,
        email,
        phone,
        sources: [source],
        isVerified: false,
      });
    }

    console.log("🚀 Call request saved successfully:", lead);

    res.status(200).json({
      success: true,
      message: "Call request submitted successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error in requestCall:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
