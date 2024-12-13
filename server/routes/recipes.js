import express from "express";
import recipe from "../models/Recipe.js";
import { query } from "../index.js"

const router = express.Router();

router.get('/recipes', async (req, res) => { //! dont know if this is right, need to add local storage first before authenticated users
    try {
        const recipes = await query("SELECT * FROM recipes");
        res.status(200).json(recipes); // sends the recipe object to the frontend
    }
    catch (error) {
        res.status(404).json({ message: error.message })
    }
});

export default router;