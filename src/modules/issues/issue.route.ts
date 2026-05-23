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

// router.get("/", issuesController.getIssues);
router.get("/:id", issuesController.getIssueById);
router.patch("/:id", issuesController.updateIssue);
router.delete("/:id", issuesController.deleteIssue);

export const issuesRoute = router;
