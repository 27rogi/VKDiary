import { dbMemor } from "../../MongooseClient";
import mongoose from 'mongoose';
import toJSON from '../../plugins/toJSON';
const increment = require('mongoose-sequence')(mongoose);

export interface IBells extends mongoose.Document {
    bellId: number;
    starts: string;
    ends: string;
}

const bellSchema = new mongoose.Schema(
{
    bellId: Number,
    starts: {
        type: String,
        required: true,
        trim: true,
    },
    ends: {
        type: String,
        required: true,
        trim: true,
    },
},
{
    timestamps: true,
}
);

// add plugin that converts mongoose to json
bellSchema.plugin(toJSON);

// use automatic incrementation for easier accessibility
bellSchema.plugin(increment, { inc_field: 'bellId' });

/**
 * @typedef Bell
 */
const Bell = dbMemor.model<IBells>('Bells', bellSchema, 'bells');

export default Bell;
