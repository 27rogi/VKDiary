import mongoose from 'mongoose';
import { ISubjects } from './subjects';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export interface IHomeworks extends mongoose.Document {
    homeworkId: number;
    subject: number;
    target: {
        description: string;
        attachments?: string;
    };
    deadline: string;
    createdAt?: Date;
    creatorId: number;
    payload?: {
        subject?: ISubjects;
    };
}

const homeworks = new mongoose.Schema(
    {
        homeworkId: Number,
        subject: {
            type: Number,
            required: true,
        },
        target: {
            description: {
                type: String,
                required: true,
            },
            attachments: {
                type: String,
                required: false,
            },
        },
        deadline: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        creatorId: {
            type: Number,
            required: true,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

homeworks.virtual('payload.subject', {
    ref: 'Subjects',
    localField: 'subject',
    foreignField: 'subjectId',
    justOne: true,
});

homeworks.plugin(AutoIncrement, { inc_field: 'homeworkId' });

export default mongoose.model<IHomeworks>('Homeworks', homeworks);
