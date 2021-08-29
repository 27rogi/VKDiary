import { dbDiary } from './../core/database/MongooseClient';
describe('(Connection): проверка работы БД', () => {
    test('подключение должно быть успешно установлено', async () => {
        const Mongoose = await dbDiary;
        expect(Mongoose.readyState).toBe(2);
        await Mongoose.close();
    });
});
