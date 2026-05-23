import { pool } from "../../db";
import type { IIssues } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssues) => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(
    `
    INSERT INTO 
    issues(title, description, type, reporter_id)
    VALUES($1, $2, $3, $4)
    RETURNING *
    
    `,
    [title, description, type, reporter_id],
  );
  return result;
};

// Issues list

type SortType = "newest" | "oldest";
type IssueType = "bug" | "feature_request";
type IssueStatus = "open" | "in_progress" | "resolved";

interface GetIssuesQuery {
  sort?: SortType;
  type?: IssueType;
  status?: IssueStatus;
}

const getIssuesIntoDB = async (query: GetIssuesQuery) => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const values: any[] = [];

  // 🔹 Filtering
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  let whereClause = "";
  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  // 🔹 Sorting
  const orderBy = sort === "oldest" ? "ASC" : "DESC";

  // 🔹 Step 1: Get issues
  const issuesResult = await pool.query(
    `
    SELECT *
    FROM issues
    ${whereClause}
    ORDER BY created_at ${orderBy}
    `,
    values,
  );

  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  // 🔹 Step 2: Collect reporter IDs
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  // 🔹 Step 3: Fetch reporters in batch (NO JOIN)
  const usersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds],
  );

  const usersMap = new Map(usersResult.rows.map((u) => [u.id, u]));

  // 🔹 Step 4: Shape final response
  const formatted = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: usersMap.get(issue.reporter_id)
      ? {
          id: usersMap.get(issue.reporter_id).id,
          name: usersMap.get(issue.reporter_id).name,
          role: usersMap.get(issue.reporter_id).role,
        }
      : null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return {
    success: true,
    data: formatted,
  };
};

export const issuesService = {
  createIssueIntoDB,
  getIssuesIntoDB,
};
