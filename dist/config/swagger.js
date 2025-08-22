"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
// config swagger
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Blog API",
            description: "API documentation for blog api",
            version: "1.0.0",
        },
        servers: [
            {
                url: "https://blog-api-nodejs-expressjs.onrender.com/",
                description: "Production server for the Blog API, providing endpoints for authentication, posts, comments, categories, and tags",
            },
        ],
    },
    apis: [path_1.default.join(__dirname, "../routes/*.ts")],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
