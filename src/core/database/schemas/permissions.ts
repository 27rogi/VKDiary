import mongoose from 'mongoose';

export default new mongoose.Schema({
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
