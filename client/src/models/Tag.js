import { getAllTagsFromLocalStorage, getRecipesByTagFromLocalStorage } from '../db/browserDB.js';

class Tag {
    static async fetchAllTags() {
        return await getAllTagsFromLocalStorage();
    };

    static async fetchRecipesByTag(tagName) {
        return await getRecipesByTagFromLocalStorage(tagName);
    };
};

export default Tag;