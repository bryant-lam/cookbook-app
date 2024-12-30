import express from 'express';
import Tag from '../models/Tag.js';

const router = express.Router()


//! make sure to carefully flowchart how to handle local storage and db request.
//! ex. user clicks filter by tags, if user is authorized(not a guest) look at db, otherwise look through local storage
router.get('/', async (req, res) => {
    try {
        const result = await Tag.getAllTags();
        return result.rows;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags'});
    }
});

export default router;