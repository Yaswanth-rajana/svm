import jwt from "jsonwebtoken";

/**
 * Authentication middleware for Admin Portal APIs
 * Validates the Authorization token.
 * Rejects the development mock token in production environment.
 */
export const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid token format",
      });
    }

    const token = authHeader.split(" ")[1];

    // Development Mock Token Check
    if (token === "mock-jwt-token-789") {
      if (process.env.NODE_ENV === "production") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Mock credentials are not allowed in production",
        });
      }
      
      // Allow mock admin in dev
      req.admin = {
        adminId: "admin_12345",
        name: "Super Administrator",
        email: "admin@smven.com",
        role: "super_admin",
      };
      return next();
    }

    // Standard JWT verification for production/secure environments
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "smven-secret-key-12345");
      
      // Ensure the decoded token represents an admin
      if (decoded.role === "admin" || decoded.role === "super_admin" || decoded.isAdmin) {
        req.admin = decoded;
        return next();
      }
    } catch (jwtErr) {
      console.warn("⚠️ Admin JWT validation failed:", jwtErr.message);
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin privileges required",
    });
  } catch (error) {
    console.error("❌ Error in requireAdminAuth middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error verifying admin authentication",
    });
  }
};
