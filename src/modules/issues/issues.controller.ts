import type { Request, Response } from "express";
import { issuesService } from "./issuess.service";
import type { IssueStatus, IssueType, SortType } from "./issues.interface";

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

const getIssueById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await issuesService.getIssueByIdIntoDB(id as string);

    const resultData = {
      ...result.data,
      reporter: result.reporter,
    };

    res.status(200).json({
      success: true,
      data: resultData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await issuesService.updateIssueIntoDB(
      req.body,
      id as string,
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
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

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await issuesService.deleteIssueIntoDB(id as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "No record found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
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
    const { sort, type, status } = req.query;
    const result = await issuesService.getIssuesIntoDB({
      sort: sort as SortType,
      type: type as IssueType,
      status: status as IssueStatus,
    });

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: "No record found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issuesController = {
  createIssue,
  getIssueById,
  updateIssue,
  deleteIssue,
  getIssues,
};
