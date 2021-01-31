import moment from 'moment';
import { APIError } from 'vk-io';
import MongooseClient from './core/database/MongooseClient';
import PluginLoader from './core/PluginLoader';
import Logger from './core/utils/Logger';
import VKClient from './core/VKClient';

const pluginLoader = new PluginLoader(__dirname + '/plugins', '.js');

MongooseClient.then(() => {
	moment.locale('ru');
	pluginLoader.load();
}).catch((err) => {
    Logger.error(err);
});

VKClient.updates.use(async (context, next: any) => {
	try {
		await next();
	} catch (error) {
		if (!context.is(['message'])) throw error;

		if (error instanceof APIError && error.code === 917) {
			await context.send('I do not have access to the chat, please give it to me.');
			return;
		}

		throw error;
	}
});

VKClient.updates.start().then(() => {
	Logger.info('Starting to watch VK updates...');
}).catch (Logger.error);
