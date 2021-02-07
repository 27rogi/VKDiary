import pino from 'pino';

export default pino({
    prettyPrint: {
        colorize: true,
        levelFirst: true,
        translateTime: 'SYS:yyyy.mm.dd HH:MM:ss',
    },
});
