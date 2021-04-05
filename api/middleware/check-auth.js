const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        var header = req.headers.authorization.split(' ');
        var token = header[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.json({
            success: false,
            message: 'Auth failed'
        });
    }
};