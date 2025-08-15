import swaggerJSDoc, { SwaggerDefinition } from "swagger-jsdoc";
import path from "path";

// config swagger
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API",
      description: "API documentation for blog api",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000", description: "Local server" }],
  },
  apis: [path.join(__dirname, "../routes/*.ts")],
};

export const swaggerSpec = swaggerJSDoc(options);
