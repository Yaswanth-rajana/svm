import axios from "axios";

export const zohoCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.ZOHO_CLIENT_ID);
    params.append("client_secret", process.env.ZOHO_CLIENT_SECRET);
    params.append("redirect_uri", process.env.ZOHO_REDIRECT_URI);
    params.append("code", code);

    const response = await axios.post("https://accounts.zoho.in/oauth/v2/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, refresh_token } = response.data;

    if (refresh_token) {
      console.log("\n================ ZOHO REFRESH TOKEN ================");
      console.log(refresh_token);
      console.log("====================================================\n");
    } else {
      console.log("\nZoho Access Token received, but no Refresh Token was provided.");
      console.log("Note: Refresh tokens are usually only provided on the first authorization.\n");
    }

    res.send("Zoho CRM connected successfully");
  } catch (error) {
    console.error("Error exchanging Zoho code:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to connect Zoho CRM",
      details: error.response?.data || error.message
    });
  }
};
