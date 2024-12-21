import { test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { resetSequences, query, resetDatabase, closePool, insertTestUser } from "../db/dbTestUtils.js";

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

//test is incomplete
test.todo('should prevent inserting Ingredient_Boxes entries for guest', async () => {
    const guestRes = await query(
        `INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *`,
        ['testguest@example.com', 'hashedpassword', 'guest']
    );

    const ingredientRes = await query(
    `INSERT INTO Ingredients (name) VALUES ($1) RETURNING *`,
    ['Onion']
    );
    
    expect(userRes.rows).toBeDefined();
    expect(userRes.rows[0].role).toBe("guest");
    expect(ingredientRes).toBeDefined();
    expect(ingredientRes.rows[0].name).toBe("Onion")
    const userId = userRes.rows[0].id;
    const ingredientId = ingredientRes.rows[0].id;

    // implement middleware role query authorization logic
    
});

test.todo('should initialize Principal for a valid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer ' + jwt.sign(
          { sub: '123', email: 'user@example.com', role: 'user', permissions: ['add:ingredient'] },
          'test_secret'
        ),
      },
    };
    const res = {};
    const next = vi.fn();
  
    process.env.JWT_SECRET = 'test_secret';
    authMiddleware(req, res, next);
  
    expect(req.principal).toBeDefined();
    expect(req.principal.id).toBe('123');
    expect(req.principal.email).toBe('user@example.com');
    expect(req.principal.role).toBe('user');
    expect(req.principal.hasPermission('add:ingredient')).toBe(true);
  });
