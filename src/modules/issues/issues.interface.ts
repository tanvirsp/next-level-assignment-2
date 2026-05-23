export type SortType = "newest" | "oldest";
export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface IIssues {
  title: string;
  description: string;
  type: IssueType;
  reporter_id: number;
}

export interface IUpdate {
  title: string;
  description: string;
  type: IssueType;
}

export interface GetIssuesQuery {
  sort?: SortType;
  type?: IssueType;
  status?: IssueStatus;
}
