export default class Principal {
    constructor(claims) {
        this.id = claims.id || null;
        this.email = claims.email || null;
        this.role = claims.role || 'guest';
        this.permissions = claims.permissions || [];
    }

    hasPermission(permission) {
        return this.permissions.includes(permission);
    }

    isInRole(role) {
        return this.role === role;
    }
}