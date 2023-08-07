import { GraphQLError } from 'graphql';
import { createMessage, getMessages } from './db/messages.js';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: async (_root, { text }, { user }) => {
      if (!user) throw unauthorizedError();
      const message = await createMessage(user, text);
      pubsub.publish('ADD_MESSAGE', { addMessage: message});
      return message;
    },
  },
  Subscription: {
    addMessage: {
      subscribe: (_root, _args, { user }) => {
        if (!user) throw unauthorizedError();
        return pubsub.asyncIterator('ADD_MESSAGE')
      }
    }
  },
};

function unauthorizedError() {
  return new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHORIZED' },
  });
}
