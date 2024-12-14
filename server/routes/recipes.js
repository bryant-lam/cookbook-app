import express from "express";
import recipe from "../models/Recipe.js";
import { query } from "../index.js"
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);


//! ALL ROUTES ARE SUBJECT TO CHANGE. THIS IS JUST THE SKELETON.

// Public Access: Everyone can see recipes
router.get('/recipes', authorize('read:recipes', true), async (req, res) => { //! dont know if this is right, need to add local storage first before authenticated users
    try {
        const recipes = await query("SELECT * FROM recipes");
        res.status(200).json(recipes); // sends the recipe object to the frontend
    }
    catch (error) {
        res.status(404).json({ message: error.message })
    }
});

//! Structure of Class 'recipe' not defined yet.
// Public Access: Guest users can create recipes locally
router.post('/recipes', authorize('write:local', true), async (req, res) => {
    const {name, ingredients } = req.body;

    if (!name || !ingredients) {
        return res.status(400).json({ error: 'Recipe name and ingreidnts are required.'})
    }
    
    return res.status(200).json({
        message: "Guest user: Recipe created locally.",
        recipe: {name, ingredients },
    })
})

// Private Access: Authenticated users can create recipes
router.post('/recipes', authorize('write:recipes'), async (req, res) => {
    try {
        const queryText = 'INSERT INTO recipes (name, ingredients) VALUES ($1, $2)';
        const values = [name, JSON.stringify(ingredients)];
        const { rows } = await query(queryText, values);

        return res.status(201).json({
            message: 'Authenticated user: Recipe created in the database',
            recipe: rows[0],
        })
    }
    catch {
        console.error('Error creating recipe:', error);
        return res.status(500).json({ error: 'Failed to create recipe.' });
    }
})

export default router;