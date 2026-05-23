import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import CookieParser from "cookie-parser";
import cors from "cors";
import { authRoute } from "./modules/auth/auth.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { issuesRoute } from "./modules/issues/issue.route";

const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

//root route
app.get("/", (req: Request, res: Response) => {
  res.send("DevPulse Server is Running");
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;
