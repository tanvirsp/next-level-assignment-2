export interface IIssues {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  reporter_id: number;
}

export interface IUpdate {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}
