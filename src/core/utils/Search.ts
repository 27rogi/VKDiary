import subjects, { ISubjects } from '../database/models/subjects';


export default {
    /**
     * This function allows you to find subject by id or name, to get multiple subjects use findSubjects()
     * @param {(number | string)} searchQuery String or number that will be used for search
     * @return {ISubjects} First ISubjects item from query
     */
    async findSubject(searchQuery: number | string) {
        let subject: ISubjects;

        if (Number.isNaN(Number(searchQuery))) {
            subject = await subjects.findOne({ name: { $regex: String(searchQuery), $options: 'i' } }).exec();
        } else {
            subject = await subjects.findOne({ subjectId: Number(searchQuery) }).exec();
        }

        return subject;
    },
    /**
     * This function allows you to find subject by id or name, to get multiple subjects use findSubjects()
     * @param {(number | string)} searchQuery String or number that will be used for search
     * @return {ISubjects[]} Array of ISubjects
     */
    async findSubjects(searchQuery: number | string) {
        let subjectList: ISubjects[];

        if (Number.isNaN(Number(searchQuery))) {
            subjectList = await subjects.find({name: {$regex: String(searchQuery), $options: 'i'}}).exec();
        } else {
            subjectList = await subjects.find({subjectId: Number(searchQuery)}).exec();
        }

        return subjectList;
    }
}



