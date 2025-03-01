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
import assets from "@/assets/images/app/assets";
import {useSession} from "@/ctx";
import {router} from "expo-router";

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

	// Randomly select an angle within the selected prize's range
	return Math.floor(Math.random() * (selectedPrize.to - selectedPrize.from) + selectedPrize.from);
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
	return prizes.find((prize) => {
		if (prize.from > prize.to) {
			return angle >= prize.from || angle < prize.to;
		}
		return angle >= prize.from && angle < prize.to;
	}) || prizes[0];
}

const PrizeWheel: React.FC = () => {
	const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
	const [currentAngle, setCurrentAngle] = useState<number>(0);
	const [timeLeft, setTimeLeft] = useState<string | null>(null);
	const [lastPrize, setLastPrize] = useState<string | null>(null);

	const rotation = useRef(new Animated.Value(0)).current;
	const currentRotation = useRef(0);

	const { session, getLastSpin, saveLastSpin } = useSession();
	const user = session;

	useEffect(() => {
		if (user) {
			const fetchLastSpin = async () => {
				const { lastSpin, lastPrize } = await getLastSpin(user.uid);
				setLastPrize(lastPrize);

				if (lastSpin) {
					const nextSpinTime = new Date(lastSpin.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later
					const now = new Date();

					if (now >= nextSpinTime) {
						setTimeLeft(null); // Spin available
						rotation.setValue(0); // Reset wheel to 0
					} else {
						const diff = nextSpinTime.getTime() - now.getTime();
						const hours = Math.floor(diff / (1000 * 60 * 60));
						const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
						setTimeLeft(`${hours} hours, ${minutes} minutes`);

						// If the last prize exists, set the wheel's position
						if (lastPrize) {
							const prize = prizes.find((p) => p.label === lastPrize);
							if (prize) {
								rotation.setValue(prize.center); // Position the wheel at the last prize
							}
						}
					}
				}
			};

			// Fetch immediately
			fetchLastSpin();

			// Set up an interval to refetch every minute
			const interval = setInterval(() => {
				fetchLastSpin();
			}, 60000); // Every 1 minute

			// Cleanup on component unmount
			return () => clearInterval(interval);
		}
	}, [user]);

	const spinWheel = async () => {
		if (user && !timeLeft) {
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

				if (prize.label === 'NO REWARD') {
					Alert.alert("Try Again", "You can try in 3 days");
				} else {
					router.push({
						pathname: '/prize-modal',
						params: {
							prize: 'Gift Card',
							qrValue: 'https://example.com/qr',
						},
					});
				}

				// Update Firestore with the new spin time and prize
				await saveLastSpin(user.uid, prize.label);

				setTimeLeft("72 hours and 0 minutes"); // Reset the timer display after a spin
			});
		} else {
			Alert.alert("Spin Not Available", `Please wait ${timeLeft} before spinning again.`);
		}
	};

	const interpolatedRotate = rotation.interpolate({
		inputRange: [0, 360],
		outputRange: ['0deg', '360deg'],
	});

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={spinWheel} style={styles.wheelContainer}>
				<Animated.View style={{ transform: [{ rotate: interpolatedRotate }] }}>
					<Image
						source={assets.beastieSpinner2}
						style={{ width: wheelSize, height: wheelSize }}
					/>
				</Animated.View>
				<View style={styles.debugWheelOverlay}>
					<Image style={styles.arrowImage} source={assets.arrow} />
				</View>
				<View style={styles.arrow}></View>
			</TouchableOpacity>
			{timeLeft ? (
				<View>
					<Text style={styles.resultText}>
						Next spin available in:
					</Text>
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
							<Text style={styles.resultText}>
								{timeLeft}
							</Text>
						</TouchableOpacity>
					) : (
						<Text style={styles.resultText}>
							{timeLeft}
						</Text>
					)}
					{/*<Text style={styles.resultText}>*/}
					{/*	{lastPrize && `\nLast prize: ${lastPrize}`}*/}
					{/*</Text>*/}
				</View>
			) : (
				selectedPrize && <Text style={styles.resultText}>You won: {selectedPrize.label}</Text>
			)}
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
		justifyContent: "flex-end",
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
		textAlign: 'center'
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
});

export default PrizeWheel;
