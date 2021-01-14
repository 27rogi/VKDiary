import mongoose from 'mongoose';
import actions from '../schemas/actions';

export default mongoose.model('Actions', actions);
