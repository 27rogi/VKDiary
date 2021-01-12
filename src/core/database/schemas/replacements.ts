import mongoose from 'mongoose';

export default new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    replacementId: {
        type: Number,
        required: true,
        uniqie: true
    },
    replacedSubject: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subjects',
    },
    replacingSubject: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subjects',
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});
