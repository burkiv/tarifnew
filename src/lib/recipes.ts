import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';

// Types
export interface ImagePosition {
    id: string;
    url: string;
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
    zIndex: number;
}

export interface Recipe {
    id: string;
    title: string;
    category: string;
    leftPageContent: string;
    rightPageContent: string;
    leftPageImages: ImagePosition[];
    rightPageImages: ImagePosition[];
    fontSize: number;
    fontFamily: string;
    fontColor: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecipeInput {
    title: string;
    category: string;
    leftPageContent: string;
    rightPageContent: string;
    leftPageImages: ImagePosition[];
    rightPageImages: ImagePosition[];
    fontSize: number;
    fontFamily: string;
    fontColor: string;
}

// Get all recipes for a user
export async function getRecipes(userId: string): Promise<Recipe[]> {
    if (!db) {
        return [];
    }

    const recipesRef = collection(db, 'users', userId, 'recipes');
    const q = query(recipesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Recipe;
    });
}

// Get a single recipe
export async function getRecipe(userId: string, recipeId: string): Promise<Recipe | null> {
    if (!db) {
        return null;
    }

    const docRef = doc(db, 'users', userId, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Recipe;
    }
    return null;
}

// Create a new recipe
export async function createRecipe(userId: string, recipe: RecipeInput): Promise<string> {
    if (!db) {
        throw new Error('Firebase is not configured');
    }

    const recipesRef = collection(db, 'users', userId, 'recipes');
    const docRef = await addDoc(recipesRef, {
        ...recipe,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

// Update a recipe
export async function updateRecipe(
    userId: string,
    recipeId: string,
    updates: Partial<RecipeInput>
): Promise<void> {
    if (!db) {
        throw new Error('Firebase is not configured');
    }

    const docRef = doc(db, 'users', userId, 'recipes', recipeId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
}

// Delete a recipe
export async function deleteRecipe(userId: string, recipeId: string): Promise<void> {
    if (!db) {
        throw new Error('Firebase is not configured');
    }

    const docRef = doc(db, 'users', userId, 'recipes', recipeId);
    await deleteDoc(docRef);
}

// Upload an image to Firebase Storage
export async function uploadImage(
    userId: string,
    recipeId: string,
    file: File
): Promise<string> {
    if (!storage) {
        throw new Error('Firebase Storage is not configured');
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `users/${userId}/recipes/${recipeId}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

// Delete an image from Firebase Storage
export async function deleteImage(imageUrl: string): Promise<void> {
    if (!storage) {
        return;
    }

    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}

// Get all categories for a user (derived from recipes)
export async function getCategories(userId: string): Promise<string[]> {
    const recipes = await getRecipes(userId);
    const categories = new Set(recipes.map((r) => r.category));
    return Array.from(categories).sort();
}
