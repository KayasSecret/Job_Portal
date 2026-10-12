import { User } from "../models/user.model.js";

/**
 * Role-based authorization middleware factory.
 * Usage: authorizeRole("recruiter") or authorizeRole("student")
 *
 * Must be placed AFTER isAuthenticated, which sets req.id.
 * Performs a DB lookup to get the authenticated user's role and attaches
 * it to req.user, then checks it against the required role.
 */
const authorizeRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.id).select("role");

            if (!user) {
                return res.status(401).json({
                    message: "User not found. Authentication invalid.",
                    success: false
                });
            }

            // Attach user role to request for use downstream
            req.user = { role: user.role };

            if (user.role !== requiredRole) {
                return res.status(403).json({
                    message: `Access denied. This action requires the '${requiredRole}' role.`,
                    success: false
                });
            }

            next();
        } catch (error) {
            console.error("❌ authorizeRole ERROR:", error.message);
            return res.status(500).json({
                message: "Authorization check failed.",
                success: false
            });
        }
    };
};

export default authorizeRole;
