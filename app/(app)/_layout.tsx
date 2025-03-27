import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {Redirect, Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import {useSession} from "@/ctx";


export default function AppLayout() {

	// const { session } = useSession();
	//
	// if (!session) {
	// 	return <Redirect href="/sign-in" />;
	// }

	return (
		<Stack screenOptions={{
			headerShown: false
		}}>
			<Stack.Screen name="index" />
			<Stack.Screen
				name="prize-modal"
				options={{
					presentation: 'modal',
					animation: 'slide_from_bottom',
				}}
			/>
			<Stack.Screen name="profile" />
		</Stack>
	);
}
