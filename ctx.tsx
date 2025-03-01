import { auth, db } from './firebase/FirebaseConfig';
import {collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	session: User | null;
	isLoading: boolean;
	saveLastSpin: (userId: string, prize: string) => Promise<void>;
	getLastSpin: (userId: string) => Promise<{ lastPrize: string | null, lastSpin: Date | null, uniqueCode: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
	signIn: async () => {},
	signOut: async () => {},
	session: null,
	isLoading: true,
	saveLastSpin: async () => {},
	getLastSpin: async () => ({ lastPrize: null, lastSpin: null, uniqueCode: null }),
});

export function useSession() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useSession must be used within an AuthProvider');
	}
	return context;
}

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [session, setSession] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setSession(user);
			setIsLoading(false);
		});
		return () => unsubscribe();
	}, []);

	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			setSession(userCredential.user);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		try {
			await firebaseSignOut(auth);
			console.log('User signed out');
			setSession(null);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const saveLastSpin = async (userId: string, prizeName: string) => {
		try {

			// Generate a unique hexadecimal code for the prize
			const uniqueCode = Array.from({ length: 8 }, () =>
				Math.floor(Math.random() * 16).toString(16)
			).join('').toUpperCase();

			// Save the last spin time and prize to the user's session (existing functionality)
			const userDocRef = doc(db, 'users', userId);
			await updateDoc(userDocRef, {
				lastSpin: new Date(),
				lastPrize: prizeName,
				uniqueCode
			});


			// Save the prize to the prizes collection
			const prizeDocRef = doc(collection(db, 'prizes'));
			await setDoc(prizeDocRef, {
				userId,
				prizeName,
				date: new Date(),
				uniqueCode,
				redeemed: false
			});

			console.log('Prize and spin saved successfully with code:', uniqueCode);
		} catch (error) {
			console.error('Error saving spin and prize:', error);
		}
	};

	const getLastSpin = async (userId: string) => {
		try {
			// Fetch the user's document
			const userDocRef = doc(db, 'users', userId);
			const userDoc = await getDoc(userDocRef);

			if (userDoc.exists()) {
				// Extract spin details
				const lastSpin = userDoc.data()?.lastSpin?.toDate() || null;
				const lastPrize = userDoc.data()?.lastPrize || null;
				const uniqueCode = userDoc.data()?.uniqueCode || null;

				return { lastPrize, lastSpin, uniqueCode };
			}
			return { lastPrize: null, lastSpin: null, uniqueCode: null };
		} catch (error) {
			console.error('Error getting last spin:', error);
			return { lastPrize: null, lastSpin: null, uniqueCode: null };
		}
	};


	return (
		<AuthContext.Provider value={{ signIn, signOut, session, isLoading, saveLastSpin, getLastSpin }}>
			{children}
		</AuthContext.Provider>
	);
}
