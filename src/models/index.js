// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Todo, Comment } = initSchema(schema);

export {
  Todo,
  Comment
};