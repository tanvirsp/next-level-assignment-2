import { Router } from "express";
import { issuesController } from "./issues.controller";
import authVerify from "../../middleware/authVarify";
import { USER_ROLE } from "../../types";

const router = Router();

router.post(
  "/",
  authVerify(USER_ROLE.contributor),
  issuesController.createIssue,
);

router.get("/", authVerify(USER_ROLE.contributor), issuesController.getIssues);
export const issuesRoute = router;
