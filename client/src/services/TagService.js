import TagModel from '../models/TagModel.js';

class TagService {
  static async getAllTags() {
    try {
        const tags = await TagModel.fetchAllTags();
        // Add any business logic here, e.g., filtering, sorting, etc.
        return tags;
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        throw error;
    }
  };

  static async getRecipesByTag(tagName) {
    try {
        const recipes = await TagModel.fetchRecipesByTag(tagName);
        return recipes;
    } catch (error) {
        console.error(`Failed to fetch recipes for tag ${tagName}:`, error);
        throw error;
    }
  };
};

export default TagService;