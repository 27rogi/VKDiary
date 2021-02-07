import moment from 'moment';
import homeworks from '../database/models/homeworks';
import replacements from '../database/models/replacements';
import Logger from './Logger';

export default {
    async cleanHomework() {
        const homeworkList = await homeworks.find().exec();
        homeworkList.forEach(
            async (homework): Promise<void> => {
                const dateDiff = moment(homework.deadline, 'DD.MM.YYYY').diff(Date.now(), 'days');
                if (dateDiff <= -7) {
                    Logger.warn(`Homework #${homework.homeworkId} is outdated and going to be deleted.`);
                    await homework.remove();
                }
            }
        );
    },
    async cleanReplacements() {
        const replacementList = await replacements.find().exec();
        replacementList.forEach(async (replacement) => {
            if (moment(replacement.date, 'DD.MM.YYYY').isAfter(moment(), 'days')) {
                Logger.warn(`Replacement #${replacement.replacementId} is outdated and going to be deleted.`);
                await replacement.remove();
            }
        });
    },
    async cleanAll() {
        await this.cleanHomework();
        await this.cleanReplacements();
    },
};
