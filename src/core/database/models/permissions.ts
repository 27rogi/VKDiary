import mongoose from 'mongoose';
import permissions from '../schemas/permissions';

export default mongoose.model('Permissions', permissions);
