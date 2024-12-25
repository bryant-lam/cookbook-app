class Principal {
    constructor(claims) {
        this.id = claims?.sub || claims?.id || null;
        this.email = claims?.email || null;
        this.roles = Array.isArray(claims?.roles) 
        ? claims?.roles.map((role) => {role.toLowerCase()}) 
        : [(claims?.roles || 'guest').toLowerCase()];
    }

    isInRole(role) {
        return this.roles.includes(role.toLowerCase());
    }

    removeRole(role) {
        this.roles = this.roles.filter((r) => {r != role.toLowerCase()});
    }
}

export default Principal;