import mongoose from 'mongoose';

export interface IPermissions extends mongoose.Document {
    userId: string
    permissionLevel: number
};

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

export default mongoose.model<IPermissions>('Permissions', permissions);
