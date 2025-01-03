import query from "../index.js";
import { getDB } from "../db/browserDB.js";

class Tag {
    static async getAllTagsFromLocalStorage() {
        const db = await getDB()
        return await db.getAll('Tags');
    }

    static async getRecipesByTagFromLocalStorage(tagName) {
        const db = await getDB();

        // Find the tag by name
        const tag = await db.getFromIndex('Tags', 'name', tagName);
        if (!tag) return [];

        // Get all recipe-tag relationships for the tag
        const recipeTags = await db.getAllFromIndex('Recipe_Tags', 'tag_id', tag.id);

        // Fetch recipes by IDs
        const recipeIds = recipeTags.map((rt) => rt.recipe_id);
        const recipes = await Promise.all(recipeIds.map((id) => db.get('Recipes', id)));

        return recipes;
    }
    
    static async getAllTagsFromDB() {
        const result = await query(
            `SELECT * FROM Tags ORDER BY name`
        )
        return result.rows;
    }

    static async getAllRecipesByTagFromDB(tagName) {
        const result = await query(
            `
            SELECT r.* from Recipes r
            JOIN Recipe_Tags rt ON r.id = rt.recipe_id
            JOIN Tags t ON rt.tag_id = t.id
            WHERE t.name = $1
            `,
            [tagName]
        );
        return result.rows;
    }
}

export default Tag;