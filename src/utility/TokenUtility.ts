import jwt from "jsonwebtoken";
import config from "../config";

// exports.EncodeToken = (id:number, name: string,  role: string, email: string) => {
//   let EXPIRE = { expiresIn: "24h" };
//   let PAYLOAD = {id, name,  role, email };
//   return jwt.sign(PAYLOAD, config.secret_key as string, EXPIRE);
// };

// exports.DecodeToken = (token) => {
//   try {
//     return jwt.verify(token, process.env.ACCESS_TOKEN);
//   } catch (e) {
//     return null;
//   }
// };
