import { pool } from "../../db";
import { USER_ROLE } from "../../types";
import type { GetIssuesQuery, IIssues, IUpdate } from "./issues.interface";

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

const getIssueByIdIntoDB = async (id: string) => {
  const data = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );

  if (data.rows.length === 0) {
    throw new Error("No record found");
  }

  const reporter = await pool.query(
    `
    SELECT id, name, role
    FROM users WHERE id=$1
    `,
    [data.rows[0].reporter_id],
  );

  delete data.rows[0].reporter_id;

  const result = {
    data: data.rows[0],
    reporter: reporter.rows[0],
  };

  return result;
};

const updateIssueIntoDB = async (
  payload: IUpdate,
  issueId: string,
  user: any,
) => {
  const { id, role } = user;
  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [issueId],
  );

  if (issueData.rowCount === 0) {
    throw new Error("Issue not found");
  }

  if (
    issueData.rows[0].reporter_id !== user.id &&
    role === USER_ROLE.contributor
  ) {
    throw new Error("Not allow to edit");
  }

  const { title, description, type, status } = payload;

  let updateStatus = "in_progress";
  if (status) {
    updateStatus = status;
  }

  const result = await pool.query(
    `
      UPDATE issues
      SET
      title=COALESCE($1, title),
      description=COALESCE($2, description),
      type=COALESCE($3, type),
      status=$4

      WHERE id=$5 RETURNING *
    `,
    [title, description, type, updateStatus, issueId],
  );

  return result;
};

const deleteIssueIntoDB = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1  
    `,
    [id],
  );

  return result;
};

const getIssuesIntoDB = async (query: GetIssuesQuery) => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const values: string[] = [];

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
    return [];
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

  return formatted;
};

export const issuesService = {
  createIssueIntoDB,
  getIssuesIntoDB,
  getIssueByIdIntoDB,
  updateIssueIntoDB,
  deleteIssueIntoDB,
};
