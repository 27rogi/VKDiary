import { dbMemor } from "../../MongooseClient";
import mongoose from 'mongoose';
import toJSON from '../../plugins/toJSON';
const increment = require('mongoose-sequence')(mongoose);

export interface ISubjects extends mongoose.Document {
    subjectId: number;
    name: string;
    location: number;
    teacher: string;
    homeworks?: {
        [key: string]: any;
    };
}

const subjectSchema = new mongoose.Schema(
{
    subjectId: Number,
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    teacher: {
        type: String,
        required: true,
        trim: true,
    },
    },
    {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    }
);

subjectSchema.plugin(increment, { inc_field: 'subjectId' });

subjectSchema.virtual('homeworks', {
    ref: 'Homeworks',
    localField: 'subjectId',
    foreignField: 'subjectId',
    justOne: false,
});

subjectSchema.set('toJSON', { virtuals: true });

subjectSchema.plugin(toJSON);

/**
 * @typedef Subject
 */
const Subject = dbMemor.model<ISubjects>('Subjects', subjectSchema, 'subjects');

export default Subject;
