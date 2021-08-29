import {
    dbDiary
} from './../core/database/MongooseClient';
import {
    Agenda
} from "agenda";
import moment from 'moment';
import {
    BasePlugin
} from '../core/classes/BasePlugin';
import Logger from '../core/utils/Logger';
import bellModel from '../core/database/models/diary/bell';
import Schedule from '../core/database/models/diary/schedules';
import Replacement, { IReplacements } from '../core/database/models/diary/replacements';
import Subject from '../core/database/models/diary/subjects';
import Bell from '../core/database/models/diary/bell';
import {
    ChangeStream
} from 'mongodb';
import Homework, { IHomeworks } from '../core/database/models/diary/homeworks';
import MessageBuilder from '../core/utils/MessageBuilder';
import Broadcaster from '../core/utils/Broadcaster';

export default class extends BasePlugin {
    agenda: Agenda;
    bellWatcher: ChangeStream < any > ;

    constructor() {
        super();
        this.agenda = new Agenda({
            mongo: dbDiary.db
        });

        this.bellWatcher = Bell.watch();
    }

    async cleanJobs() {
        const jobs = await this.agenda.jobs();
        if (jobs.length > 0) {
            await this.agenda.stop();
            Logger.info("Found jobs in database, clearing...")

            let removed = 0;
            jobs.forEach(async (job) => {
                await this.agenda.cancel({ name: job.attrs.name });
                removed++;
            })
            
            Logger.info(`Removed ${removed} old jobs`)
        }
    }

    async prepareJobs() {
        Logger.warn("There is old jobs in database! Did you run cleaning?")

        const bells = await bellModel.find();
        bells.forEach((bell) => {
            const startTime = moment(bell.starts, 'HH:mm').subtract(5, 'minutes');
            const endTime = moment(bell.ends, 'HH:mm');
            this.agenda.define(`bell-${bell.bellId}${startTime.format('HHmm')}${endTime.format('HHmm')}`, {
                lockLifetime: 10000
            }, async (job: any) => {
                const currentDate = moment(Date.now());
                const isEven = Math.abs(currentDate.week() - moment('01 09', 'DD MM').week()) % 2 === 1
                let schedule = await Schedule.findOne({
                    bellId: bell.bellId,
                    weekDay: currentDate.isoWeekday(),
                    isEven: isEven,
                });

                if (schedule) {
                    schedule = await schedule.populate([
                        {
                            path: 'subject',
                            model: Subject,
                            populate: {
                                path: 'homeworks',
                                model: Homework,
                            },
                        },
                        {
                            path: 'replacements',
                            model: Replacement,
                            populate: {
                                path: 'subject',
                                model: Subject,
                                populate: {
                                    path: 'homeworks',
                                    model: Homework,
                                },
                            },
                        },
                        {
                            path: 'bell',
                            model: Bell
                        }
                    ]);
                    let teacher = schedule.subject.teacher;
                    let location = schedule.subject.location;
                    let subject = schedule.subject;

                    schedule.replacements.forEach((replacement: IReplacements) => {
                        if (currentDate.format('DD MM') !== moment(replacement.date, 'DD/MM/YYYY').format('D MM')) return;
                        teacher = (replacement.teacher) ? replacement.teacher : replacement.subject.teacher;
                        location = (replacement.location) ? replacement.location : replacement.subject.location;
                        subject = replacement.subject;
                        schedule.replacement = replacement.toJSON();
                    });

                    if (subject.homeworks && subject.homeworks.length > 0) {
                        Logger.info('homeworks for subject are found!');
                        subject.homeworks.sort((currentHomework: IHomeworks, nextHomework: IHomeworks) => {
                            if (moment(currentHomework.date, 'DD/MM/YYYY').isBefore(moment(nextHomework.date, 'DD/MM/YYYY')))
                                return -1
                            else
                                return 1;
                        });
                        subject.homeworks.forEach((homework: IHomeworks) => {
                            if (subject.homework) return;
                            if (currentDate.isBetween(moment(homework.created).day(-1), moment(homework.date, 'DD/MM/YYYY'))) {
                                Logger.info('date is between!')
                                Logger.info(homework.toJSON());
                                subject.homework = homework.toJSON();
                            }
                        });
                    }

                    const message = new MessageBuilder({
                        header: `Пара "${subject.name}" ${(schedule.replacement) ? "(замена)" : ""} начнется через 5 минут`,
                        footer: (subject.homework) ? `По предмету есть задание, которое нужно сдать до ${moment(subject.homework.date, 'DD/MM/YYYY').format('D MMMM')}` : null
                    }).setIcon({ header: '⏳', footer: '⚠️' });

                    message.addLine([
                        `🧑 Преподаватель: ${teacher}`,
                        `🔭 Кабинет: ${location}`,
                        `⌚ Время начала: ${startTime.add(5, 'minutes').format('HH:mm')}`,
                    ])

                    Broadcaster.broadcastMessage(message.build());
                } else {
                    Logger.warn(`There is no schedules for this date on bell #${bell.bellId}`)
                }
            });

            this.agenda.every(`${startTime.get('minutes')} ${startTime.get('hours')} * * *`, `bell-${bell.bellId}${startTime.format('HHmm')}${endTime.format('HHmm')}`);
        })

        await this.agenda.start();
        Logger.info(`Registered ${(await this.agenda.jobs()).length} new jobs for bells`)
    }

    async initialize() {
        await this.cleanJobs();
        await this.prepareJobs();
    }

    async execute() {
        await this.initialize();
        this.bellWatcher.on('change', async (res) => {
            Logger.info(`Detected changes to Bells schema, recreating jobs...`);
            await this.initialize();
        });
    }
}