import { openDB } from 'idb';

// Initialize IndexedDB
let dbPromise;

if (typeof window !== 'undefined') {
    dbPromise = openDB('localStorageDB', 1, {
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
};

// Export utility functions
export async function getDB() {
    if (typeof window !== 'undefined') {
        return dbPromise;
    }
    return null;
}

/** Tag DB Functions */
export async function getAllTagsFromLocalStorage() {
    const db = await getDB();
    return await db.getAll('Tags');
}

export async function getRecipesByTagFromLocalStorage(tagName) {
    const db = await getDB();

    // Find the tag by name
    const tag = await db.getFromIndex('Tags', 'name', tagName);
    if (!tag) return [];

    // Get all recipe-tag relationships for the tag
    const recipeTags = await db.getAllFromIndex('Recipe_Tags', 'tag_id', tag.id);

    // Fetch recipes by IDs
    const recipeIds = recipeTags.map((rt) => rt.recipe_id);
    const recipes = await Promise.all(recipeIds.map((id) => db.get('Recipes', id)));

    return recipes;
}
