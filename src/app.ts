import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import routes from "./routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(compression());

app.use(morgan("dev"));

app.use(express.json({ limit: config.express.requestBodySizeLimit }));
app.use(
  express.urlencoded({
    extended: true,
    limit: config.express.requestBodySizeLimit,
  })
);

app.use("/api/v1", routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
