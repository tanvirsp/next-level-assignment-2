import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(40),
        email VARCHAR(40) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'issue_type'
        ) THEN
          CREATE TYPE issue_type AS ENUM ('bug', 'feature_request');
        END IF;
      END$$;
      `);

    await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'issue_status'
          ) THEN
            CREATE TYPE issue_status AS ENUM (
              'open',
              'in_progress',
              'resolved'
            );
          END IF;
        END$$;
        `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150),
      description TEXT CHECK (char_length(description) >= 20),
      type issue_type NOT NULL,
      status status_type DEFAULT 'open',
      reporter_id INTEGER NOT NULL,

       created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      
      )

      `);

    console.log("DB Connected");
  } catch (error) {
    console.log(error);
  }
};
