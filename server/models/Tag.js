import query from "../index.js";

class Tag {
    static async getAllTags() {
        const result = await query(
            `SELECT * FROM Tags ORDER BY name`
        )
        return result.rows;
    }

    static async getAllRecipesByTag(tagName) {
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