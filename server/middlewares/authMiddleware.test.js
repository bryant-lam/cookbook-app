import { test, describe, beforeEach, vi, expect, afterEach, importOriginal } from 'vitest';
import { authMiddleware, authorize } from './authMiddleware.js';
import jwt from 'jsonwebtoken';
import Principal from '../models/Principal.js';

vi.mock('jsonwebtoken');

//! subject to change/remove
vi.mock('pg', async (importOriginal) => {
  const actual = await importOriginal('pg');
  const Pool = vi.fn()
  const poolInstance = {
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
  };

  Pool.mockReturnValue(poolInstance);

  return { 
    ...actual,
    Pool
  };
});


describe('authMiddleware', () => {
  var req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });


  test('should return "guest" principal if no token is provided', async () => {
    await authMiddleware(req, res, next);

    expect(req.principal).toBeInstanceOf(Principal);
    expect(req.principal.isInRole('guest')).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  test('should return 403 for invalid token', async () => {
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    req.headers.authorization = 'Bearer invalid_token';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  //! Need to fix poolInstance.query.mockResolvedValueOnce. middleware is not using mock queries correctly
  test('should populate req.principal with valid token', async () => {
    const { Pool } = await import('pg'); // Ensure you are using the mocked version of Pool
    const poolInstance = new Pool();
    const mockClaims = { sub: '123', role: 'user' };
    const mockUserFromDb = { id: '123', email: 'testuser@example.com', roles: ['user'] };
    vi.spyOn(jwt, 'verify').mockReturnValue(mockClaims);
    
    poolInstance.query.mockResolvedValueOnce({ rows: [mockUserFromDb]});

    req.headers.authorization = 'Bearer valid_token';

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
    expect(req.user).toEqual(mockClaims);
    expect(req.principal).toBeInstanceOf(Principal);
    expect(req.principal.id).toBe(mockClaims.sub);
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
