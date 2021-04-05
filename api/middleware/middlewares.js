const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        jwt.verify(req.headers.authorization, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Auth failed'
                });
            }
        });
        req.userData = decoded;
        next();
    } catch (error) {
        return res.json({
            success: false,
            message: 'Auth failed'
        });
    }
};