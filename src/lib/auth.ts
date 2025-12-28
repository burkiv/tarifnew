import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    createdAt: Date;
}

// Sign up with email and password
export async function signUp(email: string, password: string, displayName: string): Promise<User> {
    if (!auth || !db) {
        throw new Error('Firebase is not configured');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: new Date(),
    });

    return user;
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<User> {
    if (!auth) {
        throw new Error('Firebase is not configured');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// Sign out
export async function signOut(): Promise<void> {
    if (!auth) {
        throw new Error('Firebase is not configured');
    }

    await firebaseSignOut(auth);
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) {
        return null;
    }

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

// Subscribe to auth state changes
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
    if (!auth) {
        // Return a no-op unsubscribe function if auth is not configured
        callback(null);
        return () => { };
    }

    return onAuthStateChanged(auth, callback);
}
