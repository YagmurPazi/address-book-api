const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./docs/openapi.json");
const contactRoutes = require("./routes/contactRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Swagger document loaded from file; set server to relative origin so it works locally and when deployed
const swaggerDocument = { ...swaggerDoc, servers: [{ url: "/" }] };

app.use("/contacts", contactRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Address Book API is running ✅ API docs: /api-docs");
});

// Expose the OpenAPI document as raw JSON
app.get("/docs/openapi.json", (req, res) => {
  res.json(swaggerDocument);
});
app.get("/openapi.json", (req, res) => {
  res.json(swaggerDocument);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Any other path
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Central error handler: Express 5 forwards errors thrown in async route handlers here
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON" });
  }
  // DtoValidationError 400, ConflictError 409 and body-parser 4xx errors
  if (err.statusCode >= 400 && err.statusCode < 500) {
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Address Book API listening on http://localhost:${PORT}`);
});
