import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger.js";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import productReviewRoutes from "./routes/product_review.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import shipmentRoutes from "./routes/shipment.routes.js";
import returnOrderRoutes from "./routes/return_order.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import homepageSectionRoutes from "./routes/homepage_section.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import auditLogRoutes from "./routes/audit_log.routes.js";
import userSessionRoutes from "./routes/user_session.routes.js";
import mediaFileRoutes from "./routes/media_file.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import analyticsEventRoutes from "./routes/analytics_event.routes.js";
import cjRoutes from "./routes/cj.routes.js";
import { startWorkers } from "./workers/sync.worker.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 8080;

// Hardening process exceptions
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Rejection");
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught Exception");
  process.exit(1);
});

// Middleware
  const pinoMiddleware = pinoHttp as any;
  app.use(pinoMiddleware({ logger }));
app.use(helmet());
app.use(express.json());

// CORS config
const frontendUrls = (process.env.FRONTEND_URL || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || frontendUrls.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

// Auth Specific Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 5000,
  message: "Too many login/register attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/product-review", productReviewRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/shipment", shipmentRoutes);
app.use("/api/return-order", returnOrderRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/homepage-section", homepageSectionRoutes);
app.use("/api/offer", offerRoutes);
app.use("/api/audit-log", auditLogRoutes);
app.use("/api/user-session", userSessionRoutes);
app.use("/api/media-file", mediaFileRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/analytics-event", analyticsEventRoutes);
app.use("/api/cj", cjRoutes);

// Centralized error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  
  try {
    await startWorkers();
  } catch (err) {
    logger.error({ err }, "Failed to start background queue/workers:");
  }
});
