import mongoose from 'mongoose';
import schedules from '../schemas/schedules';

export default mongoose.model('Schedules', schedules);
