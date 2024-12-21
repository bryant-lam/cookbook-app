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
    const userRes = await query(`SELECT id FROM Users WHERE email = $1`, ['testuser@example.com']);
    const userId = userRes.rows[0].id;

    const res = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12) RETURNING *`,
        ['Hamburger', 'Juicy Beef Hamburger', ["Cook patty", "Put bottom bun", "Apply sauce on bun", "Assemble burger"], userId,
        'Pasta', 'Delicious pasta recipe', ["Cook pasta noodles", "Make sauce", "Mix sauce with pasta noodles", "Enjoy!!"], userId,
        'Pizza', 'Large 16-Inch Pizza', ["Make dough", "Form dough into a circle", "Add tomato sauce and cheese", "Put in oven for 10 minutes at 450 F"], userId]
    );

    expect(res.rows[0]).toBeDefined();
    expect(res.rows[1]).toBeDefined();
    expect(res.rows[2]).toBeDefined();
    expect(res.rows[0].name).toBe('Hamburger');
    expect(res.rows[1].name).toBe('Pasta');
    expect(res.rows[2].name).toBe('Pizza');

    const result = await query(
        `SELECT * FROM Recipes WHERE user_id = $1`, [userId]
    );

    expect(result.rows[0].description).toBe('Juicy Beef Hamburger');
    expect(result.rows[1].description).toBe('Delicious pasta recipe');
    expect(result.rows[2].description).toBe('Large 16-Inch Pizza');
    expect(result.rows[0].user_id).toBe(userId)
    expect(result.rows.length).toBe(3);
});

test('should update a recipes description', async () => {
    const res = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        ['Hamburger', 'Juicy Beef Hamburger', ["Cook patty", "Put bottom bun", "Apply sauce on bun", "Assemble burger"], 1]
    );

    expect(res.rows[0]).toBeDefined();
    expect(res.rows[0].name).toBe('Hamburger');
    expect(res.rows[0].description).toBe('Juicy Beef Hamburger');

    const result = await query(
        `UPDATE Recipes SET description = $1 WHERE id = $2 RETURNING description`, ["Vegan Hamburger", res.rows[0].id]
    );

    expect(result.rows[0].description).toBe('Vegan Hamburger');
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

test('should cascade delete related rows when deleting a parent row', async () => {
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
            `INSERT INTO Recipes (description, instructions, user_id) VALUES ($1, $2, $3)`, 
            ['some description', ['some instructions', 'some instructions2'], userId]
        )
    ).rejects.toThrow();
});

test('FK Constraint: should fail to insert a Recipe_Tags entry for a non-existent recipe', async () => {
    // create a tag
    const tagRes = await query(
        `INSERT INTO Tags (name) VALUES ($1) RETURNING id`,
        ['Quick']
    );

    const tagId = tagRes.rows[0].id;
    expect(tagRes.rows[0]).toBeDefined();

    // fail to add the tag to a non-existent recipe id
    await expect(
        query(
            `INSERT INTO Recipe_Tags (tag_id, recipe_id) VALUES ($1, $2)`,
            [tagId, 1]
        )
    ).rejects.toThrow();
});

test('should handle inserting an extremely long recipe description', async () => {
    const longDescription = "A".repeat(10000); //description over with 10,000 characters

    const res = await query(
        `INSERT INTO Recipes (name, description, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        ["Pasta", longDescription, ['some instruction'], 1]
    );

    expect(res.rows[0]).toBeDefined();
    expect(res.rows[0].description).toBe(longDescription);
});

test('should fail when inserting a duplicate entry violating the UNIQUE constraint', async () => {
    const ingredientRes = await query(
        `INSERT INTO Ingredients (name) VALUES ($1) RETURNING *`,
        ['Onion']
    )

    expect(ingredientRes.rows).toBeDefined();
    expect(ingredientRes.rows[0].name).toBe('Onion');

    await expect(
        query(
            `INSERT INTO Ingredients (name) VALUES ($1)`,
            ['Onion']
        )
    ).rejects.toThrow();
});
