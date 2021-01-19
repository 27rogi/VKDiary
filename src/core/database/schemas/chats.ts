import mongoose from 'mongoose';

export default new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
    },
    botId: {
        type: Number,
        required: true,
    },
    doAnnounce: {
        type: Boolean,
        required: true,
    },
});
