import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== Swagger/OpenAPI =====
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KPI Management API",
      version: "1.0.0",
      description:
        "API docs for KPI Management System (Auth, Users, Roles, KPIs, KPI Updates)",
    },
    servers: [{ url: BASE_URL, description: "Current server" }],
      components: {
      securitySchemes: {
        bearerAuth: {           // << ประกาศที่นี่
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  
  // ปรับ path ให้ตรงกับโครงของคุณ
  apis: ["./src/routes/**/*.js", "./src/models/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (_req, res) => res.json(swaggerSpec));
// ===== End Swagger =====

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes (รวมอัตโนมัติจากไฟล์ *.routes.js)
app.use(routes);

export default app;
