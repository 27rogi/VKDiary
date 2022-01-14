import { dbDiary } from './../core/database/MongooseClient';
import moment from 'moment';
import { BasePlugin } from '../core/classes/BasePlugin';
import Logger from '../core/utils/Logger';
import bellModel from '../core/database/models/diary/bell';
import Schedule from '../core/database/models/diary/schedules';
import Replacement, { IReplacements } from '../core/database/models/diary/replacements';
import Subject from '../core/database/models/diary/subjects';
import Bell from '../core/database/models/diary/bell';
import { ChangeStream } from 'mongodb';
import Homework, { IHomeworks } from '../core/database/models/diary/homeworks';
import MessageBuilder from '../core/utils/MessageBuilder';
import Broadcaster from '../core/utils/Broadcaster';
import { Agenda } from 'agenda';
import settings from '../settings.json';

export default class extends BasePlugin {
    agenda: Agenda;
    bellWatcher: any;
    scheduleWatcher: any;

    constructor() {
        super();
        this.agenda = new Agenda({
            // @ts-ignore
            mongo: dbDiary.db,
        });

        this.bellWatcher = Bell.watch();
        this.scheduleWatcher = Schedule.watch();
    }

    async cleanJobs() {
        const jobs = await this.agenda.jobs();
        if (jobs.length > 0) {
            await this.agenda.stop();
            Logger.info('Found jobs in database, clearing...');

            let removed = 0;
            jobs.forEach(async (job) => {
                await this.agenda.cancel({ name: job.attrs.name });
                removed++;
            });

            Logger.info(`Removed ${removed} old jobs`);
        }
    }

    async prepareJobs() {
        const bells = await bellModel.find();
        bells.forEach((bell, index) => {
            const startTime = moment(bell.starts, 'HH:mm').subtract(5, 'minutes');
            const endTime = moment(bell.ends, 'HH:mm');
            this.agenda.define(
                `bell-${bell.bellId}${startTime.format('HHmm')}${endTime.format('HHmm')}`,
                {
                    lockLifetime: 10000,
                },
                async (job: any) => {
                    const currentDate = moment(Date.now());
                    const path = `days.${currentDate.isoWeekday()}.subjects`;

                    console.log(`Looking for subjects with bell #${bell.bellId} in days[${currentDate.isoWeekday()}]`);
                    const schedule = await Schedule.findOne({
                        weekDate: currentDate.clone().startOf('isoWeek').format('DD-MM-YYYY'),
                        [path]: {
                            $elemMatch: {
                                bellId: bell.bellId,
                            },
                        },
                    });

                    if (schedule) {
                        const subject = schedule.days[currentDate.isoWeekday()].subjects.find((subject: any) => subject.bellId === bell.bellId);
                        console.log('found schedule!');
                        console.log(currentDate.format('DD-MM-YYYY HH:mm'));
                        console.log(schedule.days[currentDate.isoWeekday()].subjects);
                        if (subject) {
                            console.log('found subject!');
                            console.log(subject);
                            subject.subject = await Subject.findOne({ subjectId: subject.subjectId });
                            let teacher = subject.subject.teacher;
                            let location = subject.subject.location;

                            if (subject.replacement) {
                                subject.replacement.subject = await Subject.findOne({ subjectId: subject.replacement.subjectId });
                                teacher = subject.replacement.teacher ? subject.replacement.teacher : subject.replacement.subject.teacher;
                                location = subject.replacement.location ? subject.replacement.location : subject.replacement.subject.location;
                            }

                            const message = new MessageBuilder({
                                header: `Пара "${subject.replacement ? subject.replacement.subject.name : subject.subject.name}" ${subject.replacement ? '(замена)' : ''} начнется через 5 минут`,
                            }).setIcon({ header: '⏳' });

                            message.addLine([`🧑 Преподаватель: ${teacher}`, `🔭 Кабинет: ${location}`, `⌚ Время начала: ${bell.starts}`]);

                            Broadcaster.broadcastMessage(message.build());
                        }
                    } else {
                        Logger.warn(`There is no schedules for days[${currentDate.isoWeekday()}] on bell #${bell.bellId}`);
                    }
                }
            );

            this.agenda.every(`${startTime.get('minutes')} ${startTime.get('hours')} * * *`, `bell-${bell.bellId}${startTime.format('HHmm')}${endTime.format('HHmm')}`, null, { timezone: 'Europe/Moscow' });
        });

        await this.agenda.start();
        Logger.info(`Registered ${(await this.agenda.jobs()).length} new jobs for bells`);
    }

    async initialize() {
        await this.cleanJobs();
        await this.prepareJobs();
    }

    async execute() {
        await this.initialize();
        this.bellWatcher.on('change', async (res: any) => {
            Logger.info(`Detected changes to Bells schema, recreating jobs...`);
            await this.initialize();
        });
        this.scheduleWatcher.on('change', async (res: any) => {
            Logger.info(`Detected changes to Schedules schema, recreating jobs...`);
            await this.initialize();
        });
    }
}
