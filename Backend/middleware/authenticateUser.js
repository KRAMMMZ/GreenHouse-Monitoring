import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
    const token = req.cookies.authToken; // Read token from cookies

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
};

export default authenticateUser;
