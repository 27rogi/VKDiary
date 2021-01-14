import mongoose from 'mongoose';
import subjects from '../schemas/subjects';

export default mongoose.model('Subjects', subjects);
