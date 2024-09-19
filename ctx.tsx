import { auth, db } from './firebase/FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	session: User | null;
	isLoading: boolean;
	saveLastSpin: (userId: string, prize: string) => Promise<void>;
	getLastSpin: (userId: string) => Promise<{ lastPrize: string | null, lastSpin: Date | null }>;
}

const AuthContext = createContext<AuthContextType>({
	signIn: async () => {},
	signOut: async () => {},
	session: null,
	isLoading: true,
	saveLastSpin: async () => {},
	getLastSpin: async () => ({ lastPrize: null, lastSpin: null }),
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

	const saveLastSpin = async (userId: string, prize: string) => {
		try {
			const userDocRef = doc(db, 'users', userId);
			await setDoc(userDocRef, { lastPrize: prize, lastSpin: new Date() }, { merge: true });
		} catch (error) {
			console.error("Error saving last spin: ", error);
		}
	};

	const getLastSpin = async (userId: string) => {
		try {
			const userDocRef = doc(db, 'users', userId);
			const userDoc = await getDoc(userDocRef);
			if (userDoc.exists()) {
				return {
					lastPrize: userDoc.data()?.lastPrize || null,
					lastSpin: userDoc.data()?.lastSpin?.toDate() || null,
				};
			}
			return { lastPrize: null, lastSpin: null };
		} catch (error) {
			console.error("Error getting last spin: ", error);
			return { lastPrize: null, lastSpin: null };
		}
	};

	return (
		<AuthContext.Provider value={{ signIn, signOut, session, isLoading, saveLastSpin, getLastSpin }}>
			{children}
		</AuthContext.Provider>
	);
}
