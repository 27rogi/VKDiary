import moment from 'moment';
import { APIError } from 'vk-io';
import { dbDiary, dbMemor } from './core/database/MongooseClient';
import PluginLoader from './core/PluginLoader';
import Logger from './core/utils/Logger';
import VKClient from './core/VKClient';

const pluginLoader = new PluginLoader(__dirname + '/plugins', process.env.PRODUCTION ? '.js' : '.ts');

Logger.info(`{ VKDiary Lite by Rogi27 }`);

dbMemor.on('open', () => {
    Logger.info('Connected to Memor Database, now connecting to Diary...');

    dbDiary.on('open', () => {
        Logger.info('Connected to Diary Database, now loading plugins...');

        moment.locale('ru');
    
        pluginLoader.load();
    })
})

VKClient.updates.use(async (context, next) => {
    try {
        await next();
    } catch (error) {
        if (!context.is(['message'])) throw error;

        if (error instanceof APIError && error.code === 917) {
            Logger.error(`I do not have access to the chat, please give it to me!`);
            return;
        }

        throw error;
    }
});

VKClient.updates
    .start()
    .then(() => {
        Logger.info('Hooked to VK updates!');
    })
    .catch(Logger.error);