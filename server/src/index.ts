import { ApolloServer, gql } from "apollo-server-express";
import "reflect-metadata";
import * as express from "express";
import { ResolverMap } from "./Types/ResolverTypes";
import { createConnection } from "typeorm";
import { User } from "./entity/User";

const startServer = async () => {
  // Construct a schema, using GraphQL schema language
  const typeDefs = gql`
    type User {
      id: Int!
      firstName: String!
      lastName: String!
      age: Int!
    }

    type Query {
      hello(name: String!): String
      users: [User!]
    }

    type Mutation {
      createUser(firstName: String!, lastName: String!, age: Int!): Boolean!
      deleteUser(id: Int!): Boolean!
      updateUser(
        id: Int!
        firstName: String
        lastName: String
        age: Int
      ): Boolean!
    }
  `;

  // Provide resolver functions for your schema fields
  const resolvers: ResolverMap = {
    Query: {
      hello: (_, { name }) => "Hello, " + name,
      users: () => User.find({ order: { id: "ASC" } }),
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
          // const user = await User.findOne({id})
          await User.delete({ id });
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

startServer();
