import { Schema, model, Document } from 'mongoose';

export interface IFavorite extends Document {
    userId: string;
    propertyIds: string[];
}

const FavoriteSchema = new Schema<IFavorite>({
    userId:      { type: String, required: true, unique: true },
    propertyIds: { type: [String], default: [] },
});

export const Favorite = model<IFavorite>('Favorite', FavoriteSchema);
