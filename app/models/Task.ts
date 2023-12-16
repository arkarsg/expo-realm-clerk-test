// app/Task.js

import Realm, { BSON, ObjectSchema } from "realm";

export class Task extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  description?: string; 
  isComplete!: boolean; 
  createdAt!: Date; 

  static primaryKey = "_id";
  static schema: ObjectSchema = {
    name: "Task",
    primaryKey: "_id",
    properties: {
      _id: 'uuid',
      description: "string",
      createdAt: {
        type: "date",
        default: new Date(),
      },
      isComplete: {
        type: "bool",
        default: false,
        indexed: true,
      },
    },
  };

  constructor(realm: Realm, description: string) {
    console.log("in constructor");
    super(realm, {
      _id: new BSON.UUID(),
      description,
    });
  }
}
