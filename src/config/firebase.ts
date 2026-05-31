import admin from 'firebase-admin';

export function initializeFirebase(): void {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!base64) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 nao definida no ambiente');
    }

    let serviceAccount: admin.ServiceAccount;
    try {
        serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    } catch {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 invalida: nao e um JSON base64 valido');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export { admin };
