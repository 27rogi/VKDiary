import mongoose from 'mongoose';

export default new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true
    },
    doAnnounce: {
        type: Boolean,
        required: true,
    },
});
