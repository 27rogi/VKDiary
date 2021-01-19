import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export default new mongoose.Schema({
    timeId: Number,
    timeStarts: {
        type: String,
        required: true
    },
    timeEnds: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
}).plugin(AutoIncrement, {inc_field: 'timeId'});
