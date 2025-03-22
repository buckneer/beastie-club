import React from 'react';
import {Image, StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
import PrizeWheel from "@/components/PrizeWheel";
import assets from "@/assets/images/app/assets";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSession } from '@/ctx';
import {router} from "expo-router";


const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768;

export default function HomeScreen() {
	const { signOut } = useSession();

	const handleSignOut = async () => {
		await signOut();
	};

	const handleNavigate = async () => {
		router.push("/profile");
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Image style={styles.headerImage} source={assets.logo} />
				{/*<TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>*/}
				{/*	<Ionicons name="log-out-outline" size={30} color="#d92e2b" />*/}
				{/*</TouchableOpacity>*/}
				<TouchableOpacity style={styles.logoutButton} onPress={handleNavigate}>
					<Ionicons name="person" size={30} color="#d92e2b" />
				</TouchableOpacity>
			</View>
			<View style={styles.titleContainer}>
				<Text style={styles.title}>SPIN TO WIN</Text>
				<Ionicons style={styles.arrowDown} name={'chevron-down'} />
			</View>
			<PrizeWheel />
			<View style={styles.titleContainer}>
				<Text style={styles.websiteTitle}>BEASTIE.BE</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#d92e2b',
	},
	header: {
		backgroundColor: "#FFF",
		borderBottomEndRadius: isTablet ? 70 : 50,  // increased border radius for tablets
		borderBottomStartRadius: isTablet ? 70 : 50,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	headerImage: {
		width: isTablet ? screenWidth * 0.4 : screenWidth * 0.6, // adjust width based on device
		height: undefined,
		aspectRatio: 1,
		resizeMode: 'contain',
	},
	logoutButton: {
		position: 'absolute',
		right: isTablet ? 30 : 16,
		top: isTablet ? 60 : 40,
		padding: 10,
	},
	titleContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		color: "#FFF",
		fontSize: isTablet ? 60 : 50, // increase font size for tablets
		marginTop: 15,
		fontWeight: "bold",
		fontFamily: "Beastie Bold"
	},
	arrowDown: {
		color: "#FFF",
		fontSize: 20,
	},
	websiteTitle: {
		color: "#FFF",
		fontSize: isTablet ? 60 : 50, // increase font size for tablets
		marginTop: 15,
		marginBottom: 20,
		fontWeight: "bold",
		fontFamily: "Beastie Bold"
	}
});
