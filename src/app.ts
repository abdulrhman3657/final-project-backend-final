import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
import { dev, port } from "./utils/helpers";
import { OK, INTERNAL_SERVER_ERROR } from "./utils/http-status";
import { connectDB, deleteAllCollections } from "./config/db";
import { AppError } from "./utils/error";
import authRoutes from "./routes/auth.routes";
import ideasRoutes from "./routes/ideas.routes";
import usersRoutes from "./routes/users.routes";
import zoomRoutes from "./routes/zoom.routes";
import adminRoutes from "./routes/admin.routes";
import commentsRoutes from "./routes/comments.routes";
import ventureBoardRoutes from "./routes/venture-board.routes"
import { startZoomToYouTubeScheduler } from "./jobs/uploadScheduler";

startZoomToYouTubeScheduler();

// // Delete all collections
// deleteAllCollections();

// Connect to MongoDB
connectDB();

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({
  limit: '10mb'
}));

// Adds security-related HTTP headers using Helmet
app.use(helmet());
// Logs HTTP requests, routing them through the custom logger
app.use(
  morgan("tiny", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
// Parses incoming JSON payloads
app.use(express.json());
// Parses URL-encoded data
app.use(express.urlencoded({ extended: true }));
// Parses cookies attached to client requests
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/zoom', zoomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ideas", ideasRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/venture-board", ventureBoardRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.status(OK).json({ message: "This is Startup Arena API - Welcome!" });
});

// Error handling middleware
// Starts an Express error-handling middleware. It catches all errors passed via next(err)
app.use(
  (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // Logs the error message
    logger.error("Error:", err.message);

    // If it's a known AppError, return structured error response with optional stack trace in dev mode
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(dev && { stack: err.stack }),
      });
      return;
    }

    // print unknown errors
    console.log(err);

    // For unknown errors, return a generic 500 error, with stack trace if in dev mode
    res.status(INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong!",
      ...(dev && { error: err.message, stack: err.stack }),
    });
  }
);

const serverPort = Number(process.env.PORT) || 3000;

// Start server
app.listen(serverPort, () => {
  logger.info(`Server is running on port ${serverPort}`);
});
