import { ApolloServer, gql, IResolvers } from "apollo-server-express";
import "reflect-metadata";
import * as express from "express";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { Component } from "./entity/Component";
import ComponentType from "./Types/ComponentType";
import ComponentList from "./Types/ComponentList";

const startServer = async () => {
  const typeDefs = gql`
    type Component {
      id: Int!
      index: String
      type: String
      text: String
    }

    input ComponentInput {
      index: Int!
      type: String!
      text: String
    }

    type User {
      id: Int!
      name: String!
      components: [Component]
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
      createComponent(userId: Int!, components: [ComponentInput]): Boolean
    }
  `;

  const resolvers: IResolvers = {
    Query: {
      hello: (_, { name }) => "Hello, " + name,
      findUser: async (_, { id }) =>
        await User.findOne({ where: { id }, relations: ["components"] }),
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
      createComponent: async (_, { userId, components }) => {
        let componentList: Component[] = [];
        components.forEach(async (component: ComponentType) => {
          if (ComponentList.includes(component.type)) {
            const comp = Component.create({ ...component, userId });
            componentList.push(comp);
          }
        });
        if (componentList.length !== components.length) {
          return false;
        } else {
          componentList.forEach(async (component: ComponentType) => {
            await Component.insert(component);
          });
          return true;
        }
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
