import { ApolloServer, gql, IResolvers } from "apollo-server-express";
import "reflect-metadata";
import * as express from "express";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { Post } from "./entity/Post";

const startServer = async () => {
  const typeDefs = gql`
    type Post {
      id: Int!
      text: String
    }

    type User {
      id: Int!
      name: String!
      posts: [Post]
    }

    type Query {
      hello(name: String!): String
      findUser(id: Int!): User
    }

    type Mutation {
      createUser(name: String): Boolean!
      deleteUser(id: Int!): Boolean!
      updateUser(
        id: Int!
        firstName: String
        lastName: String
        age: Int
      ): Boolean!
      createPost(userId: Int!, text: String): Boolean!
    }
  `;

  const resolvers: IResolvers = {
    Query: {
      hello: (_, { name }) => "Hello, " + name,
      findUser: async (_, { id }) =>
        await User.findOne({ where: { id }, relations: ["posts"] }),
    },
    Mutation: {
      createUser: async (_, args) => {
        try {
          const user = User.create(args);
          await User.insert(user);
        } catch (error) {
          return false;
        }
        return true;
      },
      updateUser: async (_, { id, ...args }) => {
        try {
          await User.update(id, args);
        } catch (error) {
          return false;
        }
        return true;
      },
      deleteUser: async (_, { id }) => {
        try {
          await User.delete({ id });
        } catch (error) {
          return false;
        }
        return true;
      },
      createPost: async (_, args) => {
        try {
          const post = Post.create(args);
          await Post.insert(post);
        } catch (error) {
          return false;
        }
        return true;
      },
    },
  };

  await createConnection();

  const server = new ApolloServer({ typeDefs, resolvers });

  const app = express();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer().catch((err) => console.log(err));
