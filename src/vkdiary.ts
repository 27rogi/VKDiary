import { APIError, VK } from 'vk-io';
import MongooseClient from './core/database/MongooseClient';
import PluginLoader from './core/PluginLoader';
import settings from './settings.json';

export const vk = new VK({
	token: settings.global.token
});

const pluginLoader = new PluginLoader(__dirname + '/plugins', '.js');

MongooseClient.then(() => {
    pluginLoader.load();
}).catch((err) => {
    console.error(err);
});

vk.updates.use(async (context, next) => {
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

vk.updates.start().catch(console.error);
