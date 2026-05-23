import type { Request, Response } from "express";
import { issuesService } from "./issuess.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporter_id = req?.user?.id;

    const issueDate = {
      title,
      description,
      type,
      reporter_id,
    };

    const result = await issuesService.createIssueIntoDB(issueDate);
    res.status(200).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getIssuesIntoDB();
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issuesController = { createIssue, getIssues };
