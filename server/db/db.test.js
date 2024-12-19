import { test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { resetSequences, query, resetDatabase, closePool, insertTestUser } from "./dbTestUtils.js";

beforeAll(async () => {
    console.log('Starting database test...');
    await resetSequences();
});

beforeEach(async () => {
    await resetDatabase();
    await insertTestUser();
});

afterAll(async () => {
    await closePool();
});

test('should insert a unique recipe-tag pair', async () => {
    const recipeRes = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        ['Pasta', 'Delicious pasta recipe', ["Cook pasta noodles", "Make sauce", "Mix sauce with pasta noodles", "Enjoy!!"], 1]
    );

    const tagRes = await query(
        `INSERT INTO Tags (name) VALUES ($1) RETURNING id`,
        ['Quick']
    );

    const recipeId = recipeRes.rows[0].id;
    const tagId = tagRes.rows[0].id;

    const res = await query (
        `INSERT INTO Recipe_Tags (recipe_id, tag_id) VALUES ($1, $2) RETURNING *`,
        [recipeId, tagId]
    );

    expect(res.rows[0]).toBeDefined();
    expect(res.rows[0].recipe_id).toBe(recipeId);
    expect(res.rows[0].tag_id).toBe(tagId);
});

test('should insert and retrieve a recipe', async () => {
    const userRes = await query(`SELECT id FROM Users WHERE email = $1`, ['testuser@example.com']);
    const userId = userRes.rows[0].id;

    const res = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        ['Hamburger', 'Juicy Beef Hamburger', ["Cook patty", "Put bottom bun", "Apply sauce on bun", "Assemble burger"], userId]
    );

    expect(res.rows[0]).toBeDefined();
    expect(res.rows[0].name).toBe('Hamburger');

    const result = await query(
        `SELECT * FROM Recipes WHERE id = $1`, [res.rows[0].id]
    );

    expect(result.rows[0].description).toBe('Juicy Beef Hamburger');
});

test('should retrieve all recipes by a specific user', async () => {

});

test('should update a recipes description', async () => {

});

test('should delete a recipe and ensure it is removed', async () => {
    const recipeRes = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Pasta', 'Yummy pasta', ['Cook pasta noodles', 'Make sauce'], 1]
    );

    const tagRes = await query(
        `INSERT INTO Tags (name) VALUES ($1) RETURNING id`, 
        ['Quick']
    );

    const recipeId = recipeRes.rows[0].id;
    const tagId = tagRes.rows[0].id;

    await query(
        `INSERT INTO Recipe_Tags (recipe_id, tag_id) VALUES ($1, $2)`,
        [recipeId, tagId]
    );

    await query(
        `DELETE FROM Recipes WHERE id = $1`, 
        [recipeId]
    );

    const result = await query(
        `SELECT * FROM Recipe_Tags WHERE recipe_id = $1`,
        [recipeId]
    );

    expect(result.rows.length).toBe(0);
});

test('DELETE CASCADE TEST: should delete a user an ensure user data is removed', async () => {
    const recipeRes = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Pasta', 'Yummy pasta', ['Cook pasta noodles', 'Make sauce'], 1]
    );

    const tagRes = await query(
        `INSERT INTO Tags (name) VALUES ($1) RETURNING id`, 
        ['Quick']
    );

    const recipeId = recipeRes.rows[0].id;
    const tagId = tagRes.rows[0].id;

    await query(
        `INSERT INTO Recipe_Tags (recipe_id, tag_id) VALUES ($1, $2)`,
        [recipeId, tagId]
    );

    await query(
        `DELETE FROM Users WHERE id = $1`, 
        [1]
    );

    const recipeTagDelRes = await query(
        `SELECT * FROM Recipe_Tags WHERE recipe_id = $1`,
        [recipeId]
    );

    const recipeDelRes = await query(
        `SELECT * FROM Recipes WHERE id = $1`,
        [recipeId]
    );

    const userDelRes = await query(
        `SELECT * FROM Users WHERE id = $1`,
        [1]
    );
    
    expect(recipeTagDelRes.rows.length).toBe(0);
    expect(recipeDelRes.rows.length).toBe(0);
    expect(userDelRes.rows.length).toBe(0);
});

test('should fail to insert duplicate recipe-tag pairs', async () => {
    const recipeRes = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        ['Pasta', 'Delicious pasta recipe', ["Cook pasta noodles", "Make sauce", "Mix sauce with pasta noodles", "Enjoy!!"], 1]
    );

    const tagRes = await query(
        `INSERT INTO Tags (name) VALUES ($1) RETURNING id`,
        ['Quick']
    );

    const recipeId = recipeRes.rows[0].id;
    const tagId = tagRes.rows[0].id;

    // add tag
    const res = await query (
        `INSERT INTO Recipe_Tags (recipe_id, tag_id) VALUES ($1, $2) RETURNING *`,
        [recipeId, tagId]
    );

    // add tag again
    await expect(
        query(
            `INSERT INTO Recipe_Tags (recipe_id, tag_id) VALUES ($1, $2) RETURNING *`,
            [recipeId, tagId]
        )
    ).rejects.toThrow();
});

test('Not Null Constraint: should fail to insert recipe without a name', async () => {
    const userRes = await query(`SELECT id FROM Users WHERE email = $1`, ["testuser@example.com"]);
    const userId = userRes.rows[0].id;
    await expect(
        query(
            `INSERT INTO Recipes (description, instructions, user_id)`, 
            ['some description', ['some instructions', 'some instructions2'], userId]
        )
    ).rejects.toThrow();
});

test('FK Constraint: should fail to insert a Recipe_Tags entry for a non-existent recipe', async () => {

});

test('should prevent inserting Ingredient_Boxes entries for guest', async () => {

});

test('should handle inserting an extremely long recipe description', async () => {

});

test('should fail when inserting a duplicate entry violating the UNIQUE constraint', async () => {

});

test('should fail when deleting a referenced row violating the FK CONSTRAINT', async () => {

});