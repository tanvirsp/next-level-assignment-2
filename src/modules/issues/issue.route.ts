import { Router } from "express";
import { issuesController } from "./issues.controller";
import authVerify from "../../middleware/authVarify";
import { USER_ROLE } from "../../types";

const router = Router();

router.post(
  "/",
  authVerify(USER_ROLE.contributor, USER_ROLE.maintainer),
  issuesController.createIssue,
);

router.get("/", authVerify(USER_ROLE.contributor), issuesController.getIssues);
router.get("/:id", issuesController.getIssueById);
router.patch(
  "/:id",
  authVerify(USER_ROLE.contributor, USER_ROLE.maintainer),
  issuesController.updateIssue,
);
router.delete(
  "/:id",
  authVerify(USER_ROLE.maintainer),
  issuesController.deleteIssue,
);

export const issuesRoute = router;
