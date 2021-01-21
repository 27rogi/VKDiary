import moment from 'moment';
import { BasePlugin } from '../core/classes/BasePlugin';
import homeworks from '../core/database/models/homeworks';
import replacements from '../core/database/models/replacements';
import Logger from '../core/utils/Logger';

export default class extends BasePlugin {
    async cleanHomework() {
        const homeworkList = await homeworks.find().exec();
        homeworkList.forEach(async (homework) => {
            const dateDiff = moment(homework.deadline, 'DD.MM.YYYY').diff(Date.now(), 'days');
            if (dateDiff <= -7) {
                Logger.warn(`Homework #${homework.homeworkId} is outdated and going to be deleted.`);
                homework.remove();
            }
        })
    }

    async cleanReplacements() {
        const replacementList = await replacements.find().exec();
        replacementList.forEach(async (replacement) => {
            if (moment(replacement.date, 'DD.MM.YYYY').isAfter(Date.now())) {
                Logger.warn(`Homework #${replacement.replacementId} is outdated and going to be deleted.`);
            }
        });
    }

    async execute() {
        this.cleanHomework();
        this.cleanReplacements();
    }
}
