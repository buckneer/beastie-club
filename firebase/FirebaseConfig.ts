import {initializeApp} from "@firebase/app";
import {getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import {getFirestore } from "@firebase/firestore";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {getStorage} from "@firebase/storage";
import {firebaseConfig} from "@/constants/Firebase";



const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
