import { dbMemor } from "../../MongooseClient";
import mongoose from 'mongoose';
import toJSON from '../../plugins/toJSON';
const increment = require('mongoose-sequence')(mongoose);

export interface IReplacements extends mongoose.Document {
    replacementId: number;
    replacedSchedule: number;
    replacingSubject: number;
    date: string;
    subject?: {
        [key: string]: any;
    };
    teacher?: string;
    location?: number;
}

const replacementSchema = new mongoose.Schema(
  {
    replacementId: Number,
    replacedSchedule: {
      type: Number,
      required: true,
      async validate(id: any) {
        const schedule = await mongoose.model('Schedules').findOne({ scheduleId: id });
        if (!schedule) {
          throw new Error('Invalid schedule identificator');
        }
      },
    },
    replacingSubject: {
      type: Number,
      required: true,
      async validate(id: any) {
        const subject = await mongoose.model('Subjects').findOne({ subjectId: id });
        if (!subject) {
          throw new Error('Invalid subject identificator');
        }
      },
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: String,
      trim: true,
    },
    location: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// use automatic incrementation for easier accessibility
replacementSchema.plugin(increment, { inc_field: 'replacementId' });

replacementSchema.virtual('schedule', {
  ref: 'Schedules',
  localField: 'replacedSchedule',
  foreignField: 'scheduleId',
  justOne: true,
});

replacementSchema.virtual('subject', {
  ref: 'Subjects',
  localField: 'replacingSubject',
  foreignField: 'subjectId',
  justOne: true,
});

replacementSchema.set('toJSON', { virtuals: true });

replacementSchema.plugin(toJSON);

/**
 * @typedef Replacement
 */
const Replacement = dbMemor.model<IReplacements>('Replacements', replacementSchema, 'replacements');

export default Replacement;
