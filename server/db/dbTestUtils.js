import pg from "pg";
import dotenv from "dotenv";
import fs from 'fs/promises';

dotenv.config({ path: '.env.test' });

/* PostgreSQL SETUP */
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const resetSequences = async () => {
  const script = await fs.readFile('./db/reset_sequences.sql', 'utf-8');
  await query(script);
};

export const insertTestUser = async () => {
  const res = await query(
    `INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
    ['testuser@example.com', 'hashedpassword', 'user']
  );
  return res.rows[0].id
}

// Helper to run queries
export const query = (text, params) => pool.query(text, params);

// Helper to reset test tables
export const resetDatabase = async () => {
  await query('TRUNCATE TABLE Recipe_Tags, Recipe_Ingredients, Ingredient_Boxes, Tags, Recipes, Ingredients, Users RESTART IDENTITY CASCADE;');
};

// Close pool after tests
export const closePool = async () => await pool.end();

export default pool;