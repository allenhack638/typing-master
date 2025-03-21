"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestData = void 0;
const validateRequestData = (schema, type = "body") => (req, res, next) => {
    try {
        if (type === "params") {
            req.params = schema.parse(req.params);
        }
        else if (type === "query") {
            req.query = schema.parse(req.query);
        }
        else {
            req.body = schema.parse(req.body);
        }
        next();
    }
    catch (error) {
        res.status(400).json({ message: `Invalid ${type} data`, errors: error });
    }
};
exports.validateRequestData = validateRequestData;
