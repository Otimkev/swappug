const { body, validationResult } = require('express-validator')
const userValidationRules = (method) => {
    switch (method) {
        case 'signup':
            return [
                body('email', 'Invalid email').isEmail(),
                // password must be at least 5 chars long
                body('password', 'Password must greater than 6').isLength({ min: 6 }),
            ];

        case 'reset_password_step1':
            return [
                body('email', 'Invalid email').isEmail(),
            ];

        case 'reset_password_step2':
            return [
                body('email', 'Invalid email').isEmail(),
                //TODO check code
            ];

        case 'reset_password_step3':
            return [
                body('email', 'Invalid email').isEmail(),
                //TODO check code
                body('password', 'Password must greater than 6').isLength({ min: 6 }),
            ];

        case 'change_password':
            return [
                body('old_password', 'Password must greater than 6').isLength({ min: 6 }),
                body('password', 'Password must greater than 6').isLength({ min: 6 }),
            ];

        case 'comment':
            return [
                body('comment', 'Short comment').isLength({ min: 1 }),
                //TODO check code
            ];
    }

}

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push(err.msg))

    return res.json({
        success: false,
        message: extractedErrors[0],
    })
}

module.exports = {
    userValidationRules,
    validate,
}
