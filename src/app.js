import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import { mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import userResolver from './resolvers/user-resolver.js';
import searchResolver from './resolvers/search-resolver.js';
import productResolver from './resolvers/product-resolver.js';
import cartResolver from './resolvers/cart-resolver.js';

const pubsub = new PubSub();

const app = express();
const port = 8082;

const schemaFiles = [
    './schema/query.graphql',
    './schema/mutation.graphql',
    './schema/subscription.graphql',
    './schema/product.graphql',
    './schema/user.graphql',
    './schema/cart.graphql'
];

const resolvers = mergeResolvers([
    userResolver,
    searchResolver,
    productResolver,
    cartResolver
]);

async function startServer() {
    const schemas = await Promise.all(
        schemaFiles.map(file => fs.readFile(file, 'utf-8'))
    );

    const schema = makeExecutableSchema({ typeDefs: schemas, resolvers });

    const server = new ApolloServer({
        schema,
        context: async () => ({
            pubsub,
        }),
    });
    await server.start();

    app.use(cors());
    app.use(bodyParser.json());
    app.use('/graphql', expressMiddleware(server, {
        context: async () => ({ pubsub})
    }));

    const httpServer = app.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    });

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql'
    });

    useServer(
        {
            schema,
            context: async () => ({
                pubsub,
            }),
        },
        wsServer
    );
}

startServer()