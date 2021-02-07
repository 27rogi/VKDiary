import { Keyboard, MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import subjects from '../../core/database/models/subjects';
import Logger from '../../core/utils/Logger';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'предметы',
            permissionLevel: 0,
            local: true,
        };
    }

    async getSubjects(pageOffset: number, limit: number) {
        return subjects
            .find({
                subjectId: { $gt: pageOffset },
            })
            .sort({
                subjectId: 1,
            })
            .limit(limit)
            .exec();
    }

    async execute(context: MessageContext, args: string[], next: any) {
        let pageOffset = 1;
        const pageLimit = 4;

        const controlsKeyboard = Keyboard.builder().oneTime(true);

        if (args.length > 0 && Number.isInteger(Number(args[0]))) {
            if (!(Number(args[0]) < 1)) {
                pageOffset = Number(args[0]);
            } else {
                return context.reply({
                    message: 'Страницы начинаются с единицы!',
                    keyboard: controlsKeyboard
                        .textButton({
                            label: 'Вперед ▶',
                            payload: {
                                command: 'предметы ' + (pageOffset + 1),
                            },
                            color: Keyboard.POSITIVE_COLOR,
                        })
                        .textButton({
                            label: 'Закрыть меню',
                            color: Keyboard.SECONDARY_COLOR,
                        }),
                });
            }
        }

        const subjectList = await this.getSubjects((pageOffset - 1) * 4, pageLimit);

        if (subjectList.length <= 0) {
            return context.reply({
                message: 'Больше предметов нет, вернитесь на прошлую страницу',
                keyboard: controlsKeyboard
                    .textButton({
                        label: '◀ Назад',
                        payload: {
                            command: 'предметы ' + (pageOffset - 1 < 1 ? 1 : pageOffset - 1),
                        },
                        color: Keyboard.NEGATIVE_COLOR,
                    })
                    .textButton({
                        label: 'Закрыть меню',
                        color: Keyboard.SECONDARY_COLOR,
                    }),
            });
        }

        subjectList.forEach((item) => {
            if (item.name.length > 40) {
                item.name = item.name.substring(0, 39) + '…';
            }
            Logger.info(item.name);

            controlsKeyboard
                .textButton({
                    label: item.name,
                    payload: {
                        command: 'предмет ' + item.subjectId,
                    },
                    color: Keyboard.PRIMARY_COLOR,
                })
                .row();
        });

        controlsKeyboard
            .textButton({
                label: '◀ Назад',
                payload: {
                    command: 'предметы ' + (pageOffset - 1 < 1 ? 1 : pageOffset - 1),
                },
                color: Keyboard.NEGATIVE_COLOR,
            })
            .textButton({
                label: 'Вперед ▶',
                payload: {
                    command: 'предметы ' + (pageOffset + 1),
                },
                color: Keyboard.POSITIVE_COLOR,
            })
            .row()
            .textButton({
                label: 'Закрыть меню',
                color: Keyboard.SECONDARY_COLOR,
            });

        await context.send({
            message: `Показываю список уроков, страница №${pageOffset}`,
            keyboard: controlsKeyboard,
        });
    }
}
