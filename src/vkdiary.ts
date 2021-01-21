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
		// We do not respond not to messages
		if (!context.is(['message'])) {
			throw error;
		}

		// If there is no access in the chat (https://vk.com/dev/messages.getConversationsById)
		if (error instanceof APIError && error.code === 917) {
			await context.send('I do not have access to the chat, please give it to me.');

			return;
		}

		// Will be caught in the previous middleware
		throw error;
	}
});

VKClient.updates.start().then(() => {
	Logger.info('Starting to watch VK updates...');
}).catch (Logger.error);
