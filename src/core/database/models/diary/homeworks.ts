import { dbMemor } from "../../MongooseClient";
import mongoose from 'mongoose';
import toJSON from '../../plugins/toJSON';
const increment = require('mongoose-sequence')(mongoose);

export interface IHomeworks extends mongoose.Document {
    homeworkId: number;
    mission: string;
    files?: {
        [key: string]: string;
    };
    subjectId: number;
    date: string;
    created: Date;
    subject?: {
        [key: string]: any;
    };
}

const homeworkSchema = new mongoose.Schema(
{
    homeworkId: Number,
    mission: {
        type: String,
        required: true,
    },
    files: {
        type: [String],
    },
    subjectId: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true,
        trim: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
    },
    {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    }
);

homeworkSchema.plugin(increment, { inc_field: 'homeworkId' });

homeworkSchema.virtual('subject', {
    ref: 'Subjects',
    localField: 'subjectId',
    foreignField: 'subjectId',
    justOne: true,
});

homeworkSchema.set('toJSON', { virtuals: true });

homeworkSchema.plugin(toJSON);

/**
 * @typedef Homework
 */
const Homework = dbMemor.model<IHomeworks>('Homeworks', homeworkSchema, 'homeworks');

export default Homework;
