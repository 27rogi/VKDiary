import mongoose from 'mongoose';
import chats from '../schemas/chats';

export default mongoose.model('Chats', chats);
