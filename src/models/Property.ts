import { Schema, model, Document } from 'mongoose';

export interface IProperty extends Document {
    title: string;
    address: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    garages: number;
    description: string;
    transactionType: 'sell' | 'rent';
    image_url: string;
    photos: string[];
    owner: string;
    contactEmail: string;
    contactPhone: string;
    createdAt: Date;
}

const PropertySchema = new Schema<IProperty>(
    {
        title:           { type: String, required: true },
        address:         { type: String, required: true },
        price:           { type: Number, required: true, min: 0 },
        area:            { type: Number, default: 0, min: 0 },
        bedrooms:        { type: Number, default: 0, min: 0 },
        bathrooms:       { type: Number, default: 0, min: 0 },
        garages:         { type: Number, default: 0, min: 0 },
        description:     { type: String, default: '' },
        transactionType: { type: String, enum: ['sell', 'rent'], required: true },
        image_url:       { type: String, default: '' },
        photos:          { type: [String], default: [] },
        owner:           { type: String, required: true },
        contactEmail:    { type: String, default: '' },
        contactPhone:    { type: String, default: '' },
    },
    { timestamps: true }
);

export const Property = model<IProperty>('HabittaMobile', PropertySchema);
