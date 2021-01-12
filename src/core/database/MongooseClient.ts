import mongoose from 'mongoose';
import settings from '../../settings.json';

export = mongoose.connect(settings.global.mongoUrl, {
        dbName: 'vkdiary_db',
        useNewUrlParser: true,
        useUnifiedTopology: false,
        reconnectTries: Number.MAX_VALUE,
});
