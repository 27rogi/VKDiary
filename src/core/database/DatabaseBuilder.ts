export default class DatabaseBuilder {

    databases: string[];

    constructor(databaseNames: string[]) {
        this.databases = databaseNames;
    }

    // init() {
    //     for (const databaseName in this.databases) {
    //         mongoose.connection.db.listCollections({
    //             name: databaseName
    //         });
    //     }
    // }

}
