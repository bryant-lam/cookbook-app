import query from "../index.js";
//! delete this because this app does not need to make direct request to ingredients table
class Ingredient {
    static async getById(id) {
        const result = await db.query(
            `SELECT * FROM Ingredients WHERE id = $1`,
            [id]);
        return result.rows[0];
    }

    static async getByName(name) {
        const result = await db.query(
            `SELECT * FROM Ingredients WHERE name = $1`,
            [name]);
        return result.rows[name];
    }

    static async create(name) {
        const result = await query(
            `INSERT INTO Ingredients (name) VALUES ($1) RETURNING *`,
            [name]
        );
        return result.rows[0];
    }

    static async update(id, name) {
        const result = await query(
            `UPDATE Ingredients SET name = $1 WHERE id = $2 RETURNING *`,
            [name, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query(
            `DELETE FROM Ingredients WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}