import { VK } from 'vk-io';
import settings from '../settings.json';

export default new VK({
    token: settings.client.token,
});
