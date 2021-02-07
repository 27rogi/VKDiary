import mongoose from 'mongoose';

export interface IActions extends mongoose.Document {
    actionId: number;
    userId: string;
    actionType: number;
}

const actions = new mongoose.Schema({
    actionId: {
        type: Number,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
    },
    actionType: {
        type: Number,
        required: true,
    },
});

export default mongoose.model<IActions>('Actions', actions);
