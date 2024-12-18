import { test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { resetSequences, query, resetDatabase, closePool } from "./dbTestUtils.js";

beforeAll(async () => {
    console.log('Starting database test...');
    await resetSequences();
});

beforeEach(async () => {
    await resetDatabase();

    await query(
        `INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
        ['testuser@example.com', 'hashedpassword', 'user']
      );
});

afterAll(async () => {
    await closePool();
});

test('should insert a unique recipe-tag pair', async () => {
    const recipeRes = await query(
        `INSERT INTO Recipes (name, description, user_id) VALUES ($1, $2, $3) RETURNING id`,
        ['Pasta', 'Delicious pasta recipe', 1]
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

