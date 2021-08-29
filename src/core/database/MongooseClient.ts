import mongoose from 'mongoose';
import settings from '../../settings.json';

export const dbDiary = mongoose.createConnection(settings.server.mongoDiary, {
    dbName: 'vkdiary_db',
});

export const dbMemor = dbDiary.useDb('memor_db')

