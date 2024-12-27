import { test, describe, beforeEach, vi, expect, afterEach, importOriginal } from 'vitest';
import { authMiddleware, authorize } from './authMiddleware.js';
import jwt from 'jsonwebtoken';
import Principal from '../models/Principal.js';

vi.mock('jsonwebtoken');

describe('authMiddleware', () => {
  var req, res, next, mockQuery;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    mockQuery = vi.fn();
  });


  test('should return "guest" principal if no token is provided', async () => {
    const middleware = authMiddleware(mockQuery);

    await middleware(req, res, next);

    expect(req.principal).toBeInstanceOf(Principal);
    expect(req.principal.isInRole('guest')).toBe(true);
    expect(next).toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('should return 403 for invalid token', async () => {
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    req.headers.authorization = 'Bearer invalid_token';

    const middleware = authMiddleware(mockQuery);
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Invalid token' });
    expect(next).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('should populate req.principal with valid token', async () => {
    const mockClaims = { sub: '123', role: 'user' };
    const mockUserFromDb = { id: '123', email: 'testuser@example.com', roles: ['user'] };
    const middleware = authMiddleware(mockQuery);
    vi.spyOn(jwt, 'verify').mockReturnValue(mockClaims);
    
    mockQuery.mockResolvedValueOnce({ rows: [mockUserFromDb]});

    req.headers.authorization = 'Bearer valid_token';

    await middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
    expect(mockQuery).toHaveBeenCalledWith(
      `SELECT * FROM Users WHERE id = $1`,
      [mockClaims.sub]
    );
    expect(req.user).toEqual(mockClaims);
    expect(req.principal).toBeInstanceOf(Principal);
    expect(req.principal.id).toBe(mockClaims.sub);
    expect(mockQuery).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

describe.todo('authorize', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      principal: null,
    };
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    next = vi.fn();
  });

  test('should allow user with required permission', () => {
    const mockPrincipal = {
      hasPermission: vi.fn().mockReturnValue(true),
      isInRole: vi.fn().mockReturnValue(false),
    };
    req.principal = mockPrincipal;

    const middleware = authorize('read:recipes');
    middleware(req, res, next);

    expect(mockPrincipal.hasPermission).toHaveBeenCalledWith('read:recipes');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 403 for user without required permission', () => {
    const mockPrincipal = {
      hasPermission: vi.fn().mockReturnValue(false),
      isInRole: vi.fn().mockReturnValue(false),
    };
    req.principal = mockPrincipal;

    const middleware = authorize('read:recipes');
    middleware(req, res, next);

    expect(mockPrincipal.hasPermission).toHaveBeenCalledWith('read:recipes');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
    expect(next).not.toHaveBeenCalled();
  });

  test('should allow guest user when allowGuest is true', () => {
    const mockPrincipal = {
      hasPermission: vi.fn(),
      isInRole: vi.fn().mockReturnValue(true),
    };
    req.principal = mockPrincipal;

    const middleware = authorize('read:recipes', true);
    middleware(req, res, next);

    expect(mockPrincipal.isInRole).toHaveBeenCalledWith('guest');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 403 for guest user when allowGuest is false', () => {
    const mockPrincipal = {
      hasPermission: vi.fn(),
      isInRole: vi.fn().mockReturnValue(true),
    };
    req.principal = mockPrincipal;

    const middleware = authorize('read:recipes', false);
    middleware(req, res, next);

    expect(mockPrincipal.isInRole).toHaveBeenCalledWith('guest');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
    expect(next).not.toHaveBeenCalled();
  });
});
