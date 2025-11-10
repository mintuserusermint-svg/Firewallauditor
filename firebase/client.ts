// firebase/client.ts
// This file encapsulates all Firebase interactions for the client-side application.
// In a real application, you would initialize Firebase in your main entry point (e.g., index.tsx).

// NOTE: These are conceptual imports. In a real project, you would install the 'firebase' package.
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

interface StartAnalysisParams {
    file: File;
    vendor: string;
    standard: string;
}

/**
 * Uploads the config file to Cloud Storage and triggers the backend analysis function.
 * @returns {string} The unique ID for the analysis report.
 */
export const uploadAndStartAnalysis = async ({ file, vendor, standard }: StartAnalysisParams): Promise<string> => {
    if (!file) throw new Error("File must be provided.");

    // These would be initialized once in your app's setup.
    const storage = getStorage();
    const functions = getFunctions();

    const reportId = crypto.randomUUID();
    const filePath = `uploads/${reportId}/${file.name}`;

    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);

    const analyzeFirewall = httpsCallable(functions, 'analyzeFirewall');
    await analyzeFirewall({
        reportId,
        vendor,
        standard,
        filePath,
    });

    return reportId;
};

/**
 * Sets up a real-time listener on a Firestore document for the report.
 * @param reportId The ID of the report to listen to.
 * @param onUpdate A callback function that receives the report data.
 * @returns {() => void} An unsubscribe function to clean up the listener.
 */
export const onReportUpdate = (reportId: string, onUpdate: (data: any) => void): (() => void) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, 'reports', reportId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            onUpdate(docSnap.data());
        }
    }, (error) => {
        console.error("Firestore listener error:", error);
        onUpdate({ status: 'error', errorMessage: 'Failed to listen for report updates.' });
    });

    return unsubscribe;
};
