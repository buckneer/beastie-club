import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Alert
} from 'react-native';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import {useSession} from "@/ctx";
import {auth, db} from "@/firebase/FirebaseConfig";

export default function Profile() {
	const { session, signOut } = useSession();

	const handleDeleteAccount = () => {
		Alert.alert(
			'Confirm Account Deletion',
			'Are you sure you want to delete your account? This action cannot be undone and will remove all your data.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							// Delete user document from Firestore
							if (session?.uid) {
								await deleteDoc(doc(db, 'users', session.uid));
							}
							// Delete user from Firebase Auth
							if (auth.currentUser) {
								await deleteUser(auth.currentUser);
							}
							Alert.alert('Account Deleted', 'Your account and data have been deleted.');
						} catch (error) {
							console.error('Error deleting account:', error);
							Alert.alert(
								'Deletion Failed',
								'There was a problem deleting your account. Please try again later.'
							);
						}
					},
				},
			]
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Profile</Text>
			{session ? (
				<>
					<Text style={styles.emailText}>Logged in as: {session.email}</Text>
					<TouchableOpacity style={styles.button} onPress={signOut}>
						<Text style={styles.buttonText}>Sign Out</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
						<Text style={styles.buttonText}>Delete Account</Text>
					</TouchableOpacity>
				</>
			) : (
				<Text style={styles.emailText}>No active session.</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F5F5',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	header: {
		fontSize: 28,
		fontWeight: '600',
		marginBottom: 30,
		color: '#333',
	},
	emailText: {
		fontSize: 16,
		marginBottom: 20,
		color: '#666',
	},
	button: {
		backgroundColor: '#007AFF',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginVertical: 10,
		width: '80%',
		alignItems: 'center',
	},
	deleteButton: {
		backgroundColor: '#FF3B30',
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
});
