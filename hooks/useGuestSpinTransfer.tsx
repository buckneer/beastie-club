import { useEffect, useState } from "react";
import { useSession } from "@/ctx";
import {getGuestSpin, removeGuestSpin} from "@/helpers/guestSpinHelpers";

export const useGuestSpinTransfer = () => {
	const { session, saveLastSpin } = useSession();
	const [isTransferred, setIsTransferred] = useState(false);

	useEffect(() => {
		const transferGuestPrize = async () => {
			if (session?.uid && !isTransferred) {
				const guestData = await getGuestSpin();

				if (guestData && guestData.prizeLabel !== "NO REWARD") {
					// Transfer prize to Firestore
					await saveLastSpin(session.uid, guestData.prizeLabel);

					// Clear guest prize data
					await removeGuestSpin();

					// Mark as transferred to prevent re-execution
					setIsTransferred(true);

					console.log("Transferred guest spin prize:", guestData.prizeLabel);
				}
			}
		};

		transferGuestPrize();
	}, [session, saveLastSpin, isTransferred]);
};
