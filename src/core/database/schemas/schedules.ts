import mongoose from 'mongoose';

export default new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    scheduleId: {
        type: Number,
        required: true,
        uniqie: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subjects',
    },
    subjectDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    isEven: {
        type: Boolean,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    }
});
