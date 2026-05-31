import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI nao definida no ambiente');
    }

    await mongoose.connect(uri);
}
