import express from 'express';
import Tag from '../models/Tag.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router()

//! make sure to carefully flowchart how to handle local storage and db request.
// Guest Route: Fetch tags from local storage
router.get('/guest', async (req, res) => {
    try {
        const tags = await Tag.getAllTagsFromLocalStorage();
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// User Route: Fetch tags from database
router.get('/user', authorize('user'), async (req, res) => {
    try {
        const tags = await Tag.getAllTagsFromDB();
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// Guest Route: Fetch recipes by tag from local storage
router.get('/guest/:tagName/recipes', async (req, res) => {
    try {
        const { tagName } = req.params;
        const recipes = await Tag.getRecipesByTagFromLocalStorage(tagName);
        if (recipes.length === 0) {
            return res.status(404).json({ error: `No recipes found for tag: ${tagName}` });
        }
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipes for tag' });
    }
});

// User Route: Fetch recipes by tag from database
router.get('/user/:tagName/recipes', authorize('user'), async (req, res) => {
    try {
        const { tagName } = req.params;
        const recipes = await Tag.getRecipesByTag(tagName);
        if (recipes.length === 0) {
            return res.status(404).json({ error: `No recipes found for tag: ${tagName}` });
        }
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipes for tag' });
    }
});

export default router;