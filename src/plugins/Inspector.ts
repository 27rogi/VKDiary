import moment from 'moment';
import { BasePlugin } from '../core/classes/BasePlugin';
import homeworks from '../core/database/models/diary/homeworks';
import replacements from '../core/database/models/diary/replacements';
import Schedule from '../core/database/models/diary/schedules';
import subjects from '../core/database/models/diary/subjects';
import Broadcaster from '../core/utils/Broadcaster';
import MessageBuilder from '../core/utils/MessageBuilder';

export default class extends BasePlugin {
    constructor() {
        super();
    }

    async execute() {
        const replacementWatcher = replacements.watch();
        const homeworkWatcher = homeworks.watch();
        
        replacementWatcher.on('change', async (res) => {
            if (res.operationType) {
                let message, replacement, replacedSchedule;

                switch (res.operationType) {
                    case ("insert"):
                        replacement = await replacements.findById(res.documentKey).populate('subject', '', subjects);
                        replacedSchedule = await Schedule.findOne({ scheduleId: replacement.replacedSchedule }).populate('subject', '', subjects);
                        
                        message = new MessageBuilder({
                            header: "Добавлена новая замена!"
                        }).setIcon({ header: '⚠️' });

                        message.addLine([
                            `📕 Урок "${replacedSchedule.subject.name}" заменён на "${replacement.subject.name}"`,
                            `⌚ Замена назначена на ${moment(replacement.date, 'DD/MM/YYYY').format('DD MMMM (dddd)')}`,
                            `🔭 Кабинет №${(replacement.location) ? replacement.location : replacement.subject.location}`,
                            `🧑 Преподаватель: ${(replacement.teacher) ? replacement.teacher : replacement.subject.teacher}`,
                        ])

                        if (replacement) Broadcaster.broadcastMessage(message.build());
                        break;
                    case ("update"):
                        replacement = await replacements.findById(res.documentKey).populate('subject', '', subjects);
                        replacedSchedule = await Schedule.findOne({ scheduleId: replacement.replacedSchedule }).populate('subject', '', subjects);
                        
                        message = new MessageBuilder({
                            header: "Обновление информации о замене!"
                        }).setIcon({ header: '⚠️' });

                        message.addLine([
                            `📕 Урок "${replacedSchedule.subject.name}" заменён на "${replacement.subject.name}"`,
                            `⌚ Замена назначена на ${moment(replacement.date, 'DD/MM/YYYY').format('DD MMMM (dddd)')}`,
                            `🔭 Кабинет №${(replacement.location) ? replacement.location : replacement.subject.location}`,
                            `🧑 Преподаватель: ${(replacement.teacher) ? replacement.teacher : replacement.subject.teacher}`,
                        ])

                        if (replacement) Broadcaster.broadcastMessage(message.build());
                        break;
                }
            }
        });

        homeworkWatcher.on('change', async (res) => {
            if (res.operationType) {
                let message, homework;

                switch (res.operationType) {
                    case ("insert"):
                        homework = await homeworks.findById(res.documentKey).populate('subject', '', subjects);
                        
                        message = new MessageBuilder({
                            header: "Добавлено новое домашнее задание!",
                            footer: `Подробнее в дневнике: https://diary.ryzhenkov.space/homeworks/${homework.homeworkId}`
                        }).setIcon({ header: '🏠', footer: '🔗' });

                        message.addLine([
                            `📕 Задание по уроку "${homework.subject.name}"`,
                            `⌚ Необходимо сдать до ${moment(homework.date, 'DD/MM/YYYY').format('DD MMMM (dddd)')}`,
                        ])

                        if (homework) Broadcaster.broadcastMessage(message.build());
                        break;
                    case ("update"):
                        homework = await homeworks.findById(res.documentKey).populate('subject', '', subjects);
                        
                        message = new MessageBuilder({
                            header: "Домашнее задание обновлено!",
                            footer: `Подробнее в дневнике: https://diary.ryzhenkov.space/homeworks/${homework.homeworkId}`
                        }).setIcon({ header: '🗞️', footer: '🔗' });

                        message.addLine([
                            `📕 Задание по уроку "${homework.subject.name}"`,
                            `⌚ Необходимо сдать до ${moment(homework.date, 'DD/MM/YYYY').format('DD MMMM (dddd)')}`,
                        ])

                        if (homework) Broadcaster.broadcastMessage(message.build());
                        break;
                }
            }
        });
    }
}
