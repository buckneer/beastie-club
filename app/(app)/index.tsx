import React from 'react';
import { Image, StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import PrizeWheel from "@/components/PrizeWheel";
import assets from "@/assets/images/app/assets";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSession } from '@/ctx';

let screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
	const { signOut } = useSession();

	const handleSignOut = async () => {
		await signOut();
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image style={styles.headerImage} source={assets.logo} />
				<TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
					<Ionicons name="log-out-outline" size={30} color="#d92e2b" />
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#d92e2b',
	},
	header: {
		backgroundColor: "#FFF",
		borderBottomEndRadius: 50,
		borderBottomStartRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	headerImage: {
		width: screenWidth * 0.6,
		height: undefined,
		aspectRatio: 1,
		resizeMode: 'contain',
	},
	logoutButton: {
		position: 'absolute',
		right: 16,
		top: 40,
		padding: 10,
	},
	titleContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		color: "#FFF",
		fontSize: 50,
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
		fontSize: 50,
		marginTop: 15,
		marginBottom: 20,
		fontWeight: "bold",
		fontFamily: "Beastie Bold"
	}
});
