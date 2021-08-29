import mongoose from 'mongoose';
import { dbDiary } from '../MongooseClient';

export interface IChats extends mongoose.Document {
    chatId: number;
    botId: number;
    doAnnounce: boolean;
}

const chats = new mongoose.Schema({
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

export default dbDiary.model<IChats>('Chats', chats);
