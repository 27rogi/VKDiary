/* eslint-disable no-param-reassign */

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

 const deleteAtPath = (obj: any, path: any, index: any) => {
    if (index === path.length - 1) {
      delete obj[path[index]];
      return;
    }
    deleteAtPath(obj[path[index]], path, index + 1);
  };
  
 const toJSON = (schema: any) => {
    let transform: (arg0: any, arg1: any, arg2: any) => any;
    if (schema.options.toJSON && schema.options.toJSON.transform) {
      transform = schema.options.toJSON.transform;
    }
  
    schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
      transform(doc: any, ret: any, options: any) {
        Object.keys(schema.paths).forEach((path) => {
          if (schema.paths[path].options && schema.paths[path].options.private) {
            deleteAtPath(ret, path.split('.'), 0);
          }
        });
  
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        if (transform) {
          return transform(doc, ret, options);
        }
      },
    });
  };
  
export default toJSON;