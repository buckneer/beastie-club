import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import {AuthProvider} from "@/ctx";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		Beastie: require('../assets/fonts/Beastie.ttf'),
		BeastieBold: require('../assets/fonts/Beastie Bold.ttf'),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<AuthProvider>
			<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
				<Stack
					screenOptions={{
						headerShown: false
					}}>
					<Stack.Screen name="(app)" options={{}} />
					<Stack.Screen name="sign-up" options={{}} />
					<Stack.Screen name="sign-in" options={{}} />
				</Stack>
			</ThemeProvider>
		</AuthProvider>
	);
}
