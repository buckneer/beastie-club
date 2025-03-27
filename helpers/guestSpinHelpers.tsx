import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_SPIN_KEY = "guestSpinData";

// Save guest spin data
export const saveGuestSpin = async (prizeLabel: string) => {
	try {
		await AsyncStorage.setItem(GUEST_SPIN_KEY, JSON.stringify({ prizeLabel }));
	} catch (error) {
		console.error("Error saving guest spin data:", error);
	}
};

// Retrieve guest spin data
export const getGuestSpin = async (): Promise<{ prizeLabel: string } | null> => {
	try {
		const data = await AsyncStorage.getItem(GUEST_SPIN_KEY);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error("Error retrieving guest spin data:", error);
		return null;
	}
};

// Remove guest spin data
export const removeGuestSpin = async () => {
	try {
		await AsyncStorage.removeItem(GUEST_SPIN_KEY);
		console.log("Guest spin data removed");
	} catch (error) {
		console.error("Error removing guest spin data:", error);
	}
};
