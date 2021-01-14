import mongoose from 'mongoose';

export default new mongoose.Schema({
    actionId: {
        type: Number,
        required: true,
        unique: true
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
