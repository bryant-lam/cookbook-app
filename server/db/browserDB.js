import { openDB } from 'idb';

// Initialize IndexedDB
const dbPromise = openDB('localStorageDB', 1, {
    upgrade(db) {
        // Create Tags store
        const tagStore = db.createObjectStore('Tags', { keyPath: 'id', autoIncrement: true });
        tagStore.createIndex('name', 'name');

        // Create Recipes store
        const recipeStore = db.createObjectStore('Recipes', { keyPath: 'id', autoIncrement: true });
        recipeStore.createIndex('name', 'name');

        // Create Recipe_Tags join store
        const recipeTagStore = db.createObjectStore('Recipe_Tags', { keyPath: 'id', autoIncrement: true });
        recipeTagStore.createIndex('tag_id', 'tag_id');
        recipeTagStore.createIndex('recipe_id', 'recipe_id');
    },
});

// Export utility functions
export async function getDB() {
    return dbPromise;
}
