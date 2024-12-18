-- User table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes Table
CREATE TABLE Recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients Table
CREATE TABLE Ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE Tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Recipe Tags (JOIN TABLE)
CREATE TABLE Recipe_Ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES Recipes(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES Ingredients(id) ON DELETE CASCADE,
    quantity VARCHAR(50), -- quantity uses VARCHAR because it can be decimals, fractions, etc.
    unit VARCHAR(50)
);

-- Ingredient Boxes
CREATE TABLE Ingredient_Boxes (
    id SERIAL PRIMARY KEY,
    ingredient_id INT REFERENCES Ingredients(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    quantity VARCHAR(50),
    unit VARCHAR(50),
    UNIQUE(ingredient_id, user_id)
);

-- Recipe Tags (JOIN TABLE)
CREATE TABLE Recipe_Tags (
    id SERIAL PRIMARY KEY,
    tag_id INT REFERENCES Tags(id) ON DELETE CASCADE,
    recipe_id INT REFERENCES Recipes(id) ON DELETE CASCADE,
    UNIQUE(tag_id, recipe_id)
);