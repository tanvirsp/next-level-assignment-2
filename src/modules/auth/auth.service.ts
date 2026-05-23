import { pool } from "../../db";
import bcrypt from "bcryptjs";
import type { ILogin, ISignup } from "./auto.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const signupUserIntoDB = async (payload: ISignup) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO 
    users(name, email, password, role)
    VALUES($1, $2, $3, COALESCE($4,'contributor'))
    RETURNING *
    
    `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

const loginUserIntoDB = async (payload: ILogin) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  // Token Generate
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const token = jwt.sign(jwtpayload, config.secret_key as string, {
    expiresIn: "1d",
  });

  delete user.password;

  return { token, user };
};

export const authService = {
  signupUserIntoDB,
  loginUserIntoDB,
};
