import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        console.log("Token:", token);

        if (!token) {
            console.log("❌ No token found");

            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);

        console.log("✅ Decoded Token:", decode);

        req.id = decode.userId;

        next();
    } catch (error) {
        console.log("❌ JWT ERROR:", error.message);

        return res.status(401).json({
            message: "Invalid token",
            success: false
        });
    }
};

export default isAuthenticated;