import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export default new mongoose.Schema({
    scheduleId: Number,
    subjectId: {
        type: Number,
        required: true,
    },
    subjectStarts: {
        type: String,
        required: true,
    },
    subjectEnds: {
        type: String,
        required: true,
    },
    isEven: {
        type: Boolean,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    }
}).plugin(AutoIncrement, {inc_field: 'scheduleId'});
