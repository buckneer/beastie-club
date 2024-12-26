import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';
import { useSession } from '@/ctx';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import {db} from "@/firebase/FirebaseConfig";

const PrizeModal: React.FC = () => {
	const router = useRouter();
	const { session, getLastSpin } = useSession();
	const [prizeData, setPrizeData] = useState<{ prize: string; qrValue: string; redeemed: boolean }>({ prize: '', qrValue: '', redeemed: false });
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPrizeData = async () => {
			if (!session) {
				setError('User not authenticated.');
				setIsLoading(false);
				return;
			}

			try {
				const { lastPrize, lastSpin, uniqueCode } = await getLastSpin(session.uid);

				if (lastPrize && uniqueCode) {
					const q = query(collection(db, 'prizes'), where('uniqueCode', '==', uniqueCode));
					const querySnapshot = await getDocs(q);

					if (!querySnapshot.empty) {
						const prizeDoc = querySnapshot.docs[0];
						const { redeemed } = prizeDoc.data();
						setPrizeData({
							prize: lastPrize,
							qrValue: `https://beastie.be/admin/prize/${uniqueCode}`,
							redeemed: redeemed || false,
						});

					} else {
						setError('Prize not found.');
					}
				} else {
					setError('No prize data available.');
				}
			} catch (err) {
				console.error('Error fetching prize data:', err);
				setError('Failed to fetch prize data.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchPrizeData();
	}, [session, getLastSpin]);

	if (isLoading) {
		return (
			<View style={styles.modalContainer}>
				<ActivityIndicator size="large" color="#000" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.modalContainer}>
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity
					style={styles.closeButton}
					onPress={() => router.back()}
				>
					<Text style={styles.closeButtonText}>Close</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.modalContainer}>
			<View style={styles.modalContent}>
				<Text style={styles.prizeText}>Congratulations!</Text>
				<Text style={styles.prizeLabel}>You won: {prizeData.prize}</Text>
				{prizeData.redeemed ? (
					<Text style={styles.errorText}>This prize has already been redeemed.</Text>
				) : (
					<View style={styles.qrCodeContainer}>
						<View style={styles.qrCodeContainer}>
							<QRCode value={prizeData.qrValue} size={150} />
						</View>
						<Text style={styles.prizeLabel}>Show this QR code to our staff to get your prize</Text>
					</View>
				)}

				<TouchableOpacity
					style={styles.closeButton}
					onPress={() => router.back()}
				>
					<Text style={styles.closeButtonText}>Close</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		width: '80%',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
	},
	prizeText: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	prizeLabel: {
		fontSize: 18,
		color: '#333',
		marginBottom: 20,
		textAlign: 'center'
	},
	qrCodeContainer: {
		marginVertical: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButton: {
		marginTop: 20,
		backgroundColor: '#d92e2b',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	closeButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	errorText: {
		color: '#d92e2b',
		fontSize: 16,
		textAlign: 'center',
	},
});

export default PrizeModal;
