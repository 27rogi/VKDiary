import MongooseClient from '../core/database/MongooseClient';

describe('(Connection): проверка работы БД', () => {
    test('подключение должно быть успешно установлено', async () => {
        const Mongoose = await MongooseClient;
        expect(Mongoose.connection.readyState).toBe(1);
        await Mongoose.connection.close();
    });
});
