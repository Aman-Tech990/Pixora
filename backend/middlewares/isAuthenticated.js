import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthenticated user!"
            });
        }
        const decode = await jwt.verify(token, process.env.SECRET);
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: "Unauthenticated user!"
            });
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

export default isAuthenticated;

