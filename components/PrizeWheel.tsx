import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Animated,
	Easing,
	Dimensions,
	Image,
	Alert,
} from 'react-native';
import assets from '@/assets/images/app/assets';
import { useSession } from '@/ctx';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGuestSpinTransfer} from "@/hooks/useGuestSpinTransfer";

const wheelSize = Dimensions.get('window').width * 0.8;

type Prize = {
	label: string;
	from: number;
	to: number;
	center: number;
	weight: number;
};

const prizes: Prize[] = [
	{ label: 'FREE BURGER', from: 330, to: 360, center: 345, weight: 0.05 },
	{ label: 'NO REWARD', from: 300, to: 330, center: 315, weight: 0.5 },
	{ label: '20% OFF', from: 270, to: 300, center: 285, weight: 0.1 },
	{ label: 'NO REWARD', from: 240, to: 270, center: 255, weight: 0.5 },
	{ label: '10% OFF', from: 210, to: 240, center: 225, weight: 0.15 },
	{ label: 'NO REWARD', from: 180, to: 210, center: 195, weight: 0.5 },
	{ label: '30% OFF', from: 150, to: 180, center: 165, weight: 0.05 },
	{ label: 'NO REWARD', from: 120, to: 150, center: 135, weight: 0.5 },
	{ label: '20% OFF', from: 90, to: 120, center: 105, weight: 0.1 },
	{ label: 'NO REWARD', from: 60, to: 90, center: 75, weight: 0.5 },
	{ label: '10% OFF', from: 30, to: 60, center: 45, weight: 0.15 },
	{ label: 'NO REWARD', from: 0, to: 30, center: 15, weight: 0.5 },
];

function getWeightedRandomAngle(): number {
	const cumulativeWeights = prizes.map((prize, index) =>
		prizes.slice(0, index + 1).reduce((acc, prize) => acc + prize.weight, 0)
	);
	const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
	const randomWeight = Math.random() * maxCumulativeWeight;
	const selectedPrizeIndex = cumulativeWeights.findIndex(
		cumulativeWeight => randomWeight <= cumulativeWeight
	);
	const selectedPrize = prizes[selectedPrizeIndex];
	return Math.floor(
		Math.random() * (selectedPrize.to - selectedPrize.from) + selectedPrize.from
	);
}

// function getWeightedRandomAngle(): number {
// 	// Always win the "FREE BURGER" prize for testing
// 	const freeBurgerPrize = prizes.find((prize) => prize.label === 'FREE BURGER');
// 	if (freeBurgerPrize) {
// 		return freeBurgerPrize.center;
// 	}
// 	// Default behavior if the prize isn't found
// 	return Math.floor(Math.random() * 360);
// }

function getPrizeByAngle(angle: number): Prize {
	return (
		prizes.find(prize => {
			if (prize.from > prize.to) {
				return angle >= prize.from || angle < prize.to;
			}
			return angle >= prize.from && angle < prize.to;
		}) || prizes[0]
	);
}

// AsyncStorage helper functions for guest users
const saveGuestSpin = async (lastSpin: Date, prizeLabel: string) => {
	try {
		const data = JSON.stringify({ lastSpin: lastSpin.toISOString(), prizeLabel });
		await AsyncStorage.setItem('guestSpinData', data);
		console.log('Guest spin saved:', data);
	} catch (error) {
		console.error('Error saving guest spin data', error);
	}
};

const getGuestSpin = async () => {
	try {
		const data = await AsyncStorage.getItem('guestSpinData');
		if (data) {
			const parsed = JSON.parse(data);
			console.log('Retrieved guest spin data:', parsed);
			return { lastSpin: new Date(parsed.lastSpin), prizeLabel: parsed.prizeLabel };
		}
	} catch (error) {
		console.error('Error retrieving guest spin data', error);
	}
	return null;
};

const removeGuestSpin = async () => {
	try {
		await AsyncStorage.removeItem('guestSpinData');
		console.log('Guest spin data removed');
	} catch (error) {
		console.error('Error removing guest spin data', error);
	}
};

const PrizeWheel: React.FC = () => {
	const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
	const [currentAngle, setCurrentAngle] = useState<number>(0);
	const [timeLeft, setTimeLeft] = useState<string | null>(null);
	const [lastPrize, setLastPrize] = useState<string | null>(null);

	const rotation = useRef(new Animated.Value(0)).current;
	const currentRotation = useRef(0);

	const { session, getLastSpin, saveLastSpin } = useSession();
	const user = session;
	useGuestSpinTransfer();

	// Check for the last spin (from Firestore for registered users or AsyncStorage for guests)
	useEffect(() => {
		const fetchLastSpin = async () => {
			let lastSpinData;
			let storedPrize: string | null = null;
			if (user) {
				const { lastSpin, lastPrize } = await getLastSpin(user.uid);
				lastSpinData = lastSpin;
				storedPrize = lastPrize;
			} else {
				const guestData = await getGuestSpin();
				if (guestData) {
					lastSpinData = guestData.lastSpin;
					storedPrize = guestData.prizeLabel;
				}
			}

			setLastPrize(storedPrize);

			if (lastSpinData) {
				const nextSpinTime = new Date(lastSpinData.getTime() + 3 * 24 * 60 * 60 * 1000);
				const now = new Date();

				if (now >= nextSpinTime) {
					setTimeLeft(null);
					rotation.setValue(0);
				} else {
					const diff = nextSpinTime.getTime() - now.getTime();
					const hours = Math.floor(diff / (1000 * 60 * 60));
					const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
					setTimeLeft(`${hours} hours, ${minutes} minutes`);

					if (storedPrize) {
						const prize = prizes.find(p => p.label === storedPrize);
						if (prize) {
							rotation.setValue(prize.center);
						}
					}
				}
			}
		};

		fetchLastSpin();
		const interval = setInterval(() => {
			fetchLastSpin();
		}, 60000);

		return () => clearInterval(interval);
	}, [user]);

	// Transfer guest spin data to Firestore after sign-in
	const transferGuestDataToFirestore = async (uid: string) => {
		try {
			const guestData = await getGuestSpin();
			if (guestData) {
				// Save the most recent guest spin reward to Firestore
				await saveLastSpin(uid, guestData.prizeLabel);
				await removeGuestSpin();
			}
		} catch (error) {
			console.error('Error transferring guest data', error);
		}
	};

	const spinWheel = async () => {
		if (timeLeft) {
			Alert.alert('Spin Not Available', `Please wait ${timeLeft} before spinning again.`);
			return;
		}

		const randomAngle = getWeightedRandomAngle();
		const prize = getPrizeByAngle(randomAngle);
		const targetAngle = 360 * 5 + prize.center;

		Animated.timing(rotation, {
			toValue: targetAngle,
			duration: 5000,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start(async () => {
			setSelectedPrize(prize);
			currentRotation.current = targetAngle % 360;
			setCurrentAngle(currentRotation.current);
			rotation.setValue(currentRotation.current);

			const now = new Date();

			if (user) {
				// Registered user flow
				if (prize.label === 'NO REWARD') {
					Alert.alert('Try Again', 'You can try in 3 days');
				} else {
					router.push({
						pathname: '/prize-modal',
						params: {
							prize: prize.label,
							qrValue: 'https://example.com/qr',
						},
					});
				}
				await saveLastSpin(user.uid, prize.label);
				setTimeLeft('72 hours and 0 minutes');
			} else {
				// Guest user flow: Remove old data then save new data
				await removeGuestSpin();
				// Delay briefly to ensure removal completes before saving new data
				setTimeout(async () => {
					await saveGuestSpin(now, prize.label);
					// Immediately update local state with the new prize
					setLastPrize(prize.label);
					setTimeLeft('72 hours and 0 minutes'); // Block further spins until cooldown expires
					if (prize.label === 'NO REWARD') {
						Alert.alert('Try Again', 'You can try in 3 days as a guest');
					} else {
						Alert.alert(
							'Sign In Required',
							'You received a reward. Please sign in to redeem it.',
							[
								{ text: 'Cancel', style: 'cancel' },
								{
									text: 'Sign In',
									onPress: () => {
										router.push('/sign-in');
									},
								},
							]
						);
					}
				}, 100);
			}
		});
	};

	// Testing button: Resets the cooldown and clears guest spin data
	const resetSpin = async () => {
		await removeGuestSpin();
		setTimeLeft(null);
		setLastPrize(null);
		rotation.setValue(0);
		Alert.alert('Test Mode', 'Spin reset. You can spin the wheel again.');
	};

	const interpolatedRotate = rotation.interpolate({
		inputRange: [0, 360],
		outputRange: ['0deg', '360deg'],
	});

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={spinWheel} style={styles.wheelContainer}>
				<Animated.View style={{ transform: [{ rotate: interpolatedRotate }] }}>
					<Image source={assets.beastieSpinner2} style={{ width: wheelSize, height: wheelSize }} />
				</Animated.View>
				<View style={styles.arrow}></View>
			</TouchableOpacity>
			{timeLeft ? (
				<View>
					<Text style={styles.resultText}>Next spin available in:</Text>
					{lastPrize !== 'NO REWARD' ? (
						<TouchableOpacity
							onPress={() => {
								router.push({
									pathname: '/prize-modal',
									params: {
										prize: lastPrize || 'Gift Card',
										qrValue: 'https://example.com/qr',
									},
								});
							}}
						>
							<Text style={styles.resultText}>{timeLeft}</Text>
						</TouchableOpacity>
					) : (
						<Text style={styles.resultText}>{timeLeft}</Text>
					)}
				</View>
			) : (
				selectedPrize && <Text style={styles.resultText}>You won: {selectedPrize.label}</Text>
			)}
			{/* Testing button to reset the cooldown */}
			{/*<TouchableOpacity onPress={resetSpin} style={styles.resetButton}>*/}
			{/*	<Text style={styles.resetButtonText}>Reset Spin (Test)</Text>*/}
			{/*</TouchableOpacity>*/}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#d92e2b',
		padding: 20,
	},
	wheelContainer: {
		width: wheelSize,
		height: wheelSize,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 30,
	},
	debugWheelOverlay: {
		position: 'absolute',
		top: 0,
		left: -26,
		width: wheelSize,
		height: wheelSize,
		justifyContent: 'flex-end',
		alignItems: 'flex-start',
	},
	arrowImage: {
		width: 100,
		height: undefined,
		aspectRatio: 1,
		left: 0,
		resizeMode: 'contain',
	},
	resultText: {
		fontWeight: 'bold',
		fontSize: 22,
		color: '#fff',
		textAlign: 'center',
	},
	arrow: {
		position: 'absolute',
		top: 30,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: 10,
		borderRightWidth: 10,
		borderTopWidth: 15,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: '#FFD700',
		zIndex: 1,
	},
	resetButton: {
		marginTop: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: '#444',
		borderRadius: 5,
	},
	resetButtonText: {
		color: '#fff',
		fontSize: 16,
	},
});

export default PrizeWheel;
