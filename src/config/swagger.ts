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
    servers: [
      {
        url: "https://blog-api-nodejs-expressjs.onrender.com/",
        description:
          "Production server for the Blog API, providing endpoints for authentication, posts, comments, categories, and tags",
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.ts")],
};

export const swaggerSpec = swaggerJSDoc(options);
