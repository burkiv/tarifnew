// Demo mode storage using localStorage
// This allows testing the app without Firebase

import { Recipe, RecipeInput, ImagePosition } from './recipes';

const DEMO_USER_KEY = 'tarif_defteri_demo_user';
const DEMO_RECIPES_KEY = 'tarif_defteri_demo_recipes';

export interface DemoUser {
    uid: string;
    email: string;
    displayName: string;
}

// Check if we're in demo mode (no Firebase configured)
export function isDemoMode(): boolean {
    return !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
}

// Demo authentication
export function getDemoUser(): DemoUser | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(DEMO_USER_KEY);
    return userData ? JSON.parse(userData) : null;
}

export function setDemoUser(user: DemoUser): void {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
}

export function clearDemoUser(): void {
    localStorage.removeItem(DEMO_USER_KEY);
}

export function demoSignUp(email: string, displayName: string): DemoUser {
    const user: DemoUser = {
        uid: `demo-${Date.now()}`,
        email,
        displayName,
    };
    setDemoUser(user);
    return user;
}

export function demoSignIn(email: string): DemoUser {
    // In demo mode, just create/get user by email
    const existingUser = getDemoUser();
    if (existingUser && existingUser.email === email) {
        return existingUser;
    }

    const user: DemoUser = {
        uid: `demo-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
    };
    setDemoUser(user);
    return user;
}

// Demo recipes storage
export function getDemoRecipes(): Recipe[] {
    if (typeof window === 'undefined') return [];
    const recipesData = localStorage.getItem(DEMO_RECIPES_KEY);
    if (!recipesData) return [];

    const recipes = JSON.parse(recipesData);
    return recipes.map((r: Recipe) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
    }));
}

export function saveDemoRecipes(recipes: Recipe[]): void {
    localStorage.setItem(DEMO_RECIPES_KEY, JSON.stringify(recipes));
}

export function createDemoRecipe(recipe: RecipeInput): string {
    const recipes = getDemoRecipes();
    const newRecipe: Recipe = {
        ...recipe,
        id: `recipe-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    recipes.unshift(newRecipe);
    saveDemoRecipes(recipes);
    return newRecipe.id;
}

export function updateDemoRecipe(recipeId: string, updates: Partial<RecipeInput>): void {
    const recipes = getDemoRecipes();
    const index = recipes.findIndex(r => r.id === recipeId);
    if (index !== -1) {
        recipes[index] = {
            ...recipes[index],
            ...updates,
            updatedAt: new Date(),
        };
        saveDemoRecipes(recipes);
    }
}

export function deleteDemoRecipe(recipeId: string): void {
    const recipes = getDemoRecipes();
    const filtered = recipes.filter(r => r.id !== recipeId);
    saveDemoRecipes(filtered);
}

export function getDemoCategories(): string[] {
    const recipes = getDemoRecipes();
    const categories = new Set(recipes.map(r => r.category).filter(Boolean));
    return Array.from(categories).sort();
}

// Convert file to base64 for local storage (demo mode only)
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}
