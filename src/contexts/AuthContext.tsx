'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthState, signIn as firebaseSignIn, signUp as firebaseSignUp, signOut as firebaseSignOut, UserProfile, getUserProfile } from '@/lib/auth';
import { isDemoMode, getDemoUser, demoSignIn, demoSignUp, clearDemoUser, DemoUser } from '@/lib/demo';

interface AuthContextType {
    user: User | DemoUser | null;
    profile: UserProfile | null;
    loading: boolean;
    isDemo: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | DemoUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        // Check if we're in demo mode
        if (isDemoMode()) {
            setIsDemo(true);
            const demoUser = getDemoUser();
            if (demoUser) {
                setUser(demoUser);
                setProfile({
                    uid: demoUser.uid,
                    email: demoUser.email,
                    displayName: demoUser.displayName,
                    createdAt: new Date(),
                });
            }
            setLoading(false);
            return;
        }

        // Firebase mode
        const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const userProfile = await getUserProfile(firebaseUser.uid);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleSignIn = async (email: string, password: string) => {
        if (isDemo) {
            const demoUser = demoSignIn(email);
            setUser(demoUser);
            setProfile({
                uid: demoUser.uid,
                email: demoUser.email,
                displayName: demoUser.displayName,
                createdAt: new Date(),
            });
        } else {
            await firebaseSignIn(email, password);
        }
    };

    const handleSignUp = async (email: string, password: string, displayName: string) => {
        if (isDemo) {
            const demoUser = demoSignUp(email, displayName);
            setUser(demoUser);
            setProfile({
                uid: demoUser.uid,
                email: demoUser.email,
                displayName: demoUser.displayName,
                createdAt: new Date(),
            });
        } else {
            await firebaseSignUp(email, password, displayName);
        }
    };

    const handleSignOut = async () => {
        if (isDemo) {
            clearDemoUser();
            setUser(null);
            setProfile(null);
        } else {
            await firebaseSignOut();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                isDemo,
                signIn: handleSignIn,
                signUp: handleSignUp,
                signOut: handleSignOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
