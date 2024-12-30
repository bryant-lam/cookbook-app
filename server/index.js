import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import pg from "pg";
import recipeRoutes from "./routes/recipe.js";
import tagRoutes from "./routes/tag.js"
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { query } from "./db/dbTestUtils.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/** PUBLIC ROUTES */

/** MIDDLEWARE */
const middleware = authMiddleware(query);
app.use(middleware);

/** PRIVATE ROUTES */
app.use('/recipe', recipeRoutes);
app.use('/tag', tagRoutes);


/* PostgreSQL SETUP */
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Export the pool for use in other parts of the app
module.exports = {
  query: (text, params) => pool.query(text, params),
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`))
