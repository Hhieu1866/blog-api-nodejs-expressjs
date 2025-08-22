"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        return res
            .status(400)
            .json({ errors: error.errors || { message: "Invalid data" } });
    }
};
exports.validate = validate;
