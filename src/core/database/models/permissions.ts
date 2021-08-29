import mongoose from 'mongoose';
import { dbDiary } from '../MongooseClient';

export interface IPermissions extends mongoose.Document {
    userId: string;
    permissionLevel: number;
}

const permissions = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    permissionLevel: {
        type: Number,
        required: true,
    },
});

export default dbDiary.model<IPermissions>('Permissions', permissions);
