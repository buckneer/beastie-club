import {
	ActivityIndicator,
	Image,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Dimensions,
	KeyboardAvoidingView,
	Platform
} from "react-native";
import { useSession } from "@/ctx";
import React, { useState } from "react";
import { Redirect, router } from "expo-router";
import assets from "@/assets/images/app/assets";

const { width: screenWidth } = Dimensions.get('window');

const SignIn = () => {
	const { signIn, isLoading, session } = useSession();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	if (session) {
		return <Redirect href="/(app)" />;
	}

	const handleLogin = async () => {
		setError('');
		try {
			await signIn(email, password);
		} catch (e) {
			setError('Failed to sign in. Please check your credentials and try again.');
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.imageContainer}>
					<Image style={styles.image} source={assets.logo} />
				</View>
				{error ? <Text style={styles.error}>{error}</Text> : null}
				<View style={styles.inputContainer}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						placeholder="Email"
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				</View>
				<View style={styles.inputContainer}>
					<Text style={styles.label}>Password</Text>
					<TextInput
						style={styles.input}
						value={password}
						onChangeText={setPassword}
						placeholder="Password"
						secureTextEntry
					/>
				</View>
				<TouchableOpacity style={styles.button} onPress={handleLogin}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.navigate('/sign-up')}>
					<Text style={styles.leading}>Register for Beastie Club</Text>
				</TouchableOpacity>
				{isLoading && <ActivityIndicator style={styles.loading} />}
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 16,
	},
	imageContainer: {
		alignItems: 'center',
		marginBottom: 32,
	},
	image: {
		width: screenWidth * 0.7,
		height: undefined,
		aspectRatio: 1, // Ensure the image keeps its aspect ratio
		resizeMode: 'contain',
	},
	title: {
		fontSize: 24,
		marginBottom: 16,
		textAlign: 'center',
	},
	inputContainer: {
		marginBottom: 12,
	},
	label: {
		fontSize: 16,
		color: '#000',
		marginBottom: 4,
	},
	input: {
		height: 40,
		borderColor: '#000',
		borderWidth: 1,
		paddingHorizontal: 8,
		borderRadius: 4,
		color: "#000",
	},
	error: {
		color: '#d92e2b',
		marginBottom: 12,
		textAlign: 'center',
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 15,
		paddingHorizontal: 32,
		borderRadius: 10,
		elevation: 3,
		backgroundColor: '#d92e2b',
		marginTop: 12,
	},
	buttonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: "bold",
	},
	loading: {
		marginTop: 16,
	},
	leading: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: "bold",
		marginTop: 10,
		color: "#d92e2b",
	}
});

export default SignIn;
