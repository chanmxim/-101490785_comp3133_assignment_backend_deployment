import dotenv from "dotenv";
import express from "express"
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from "cors";
import jwt from 'jsonwebtoken';

import typeDefs from "./graphql/schema/schema.js";
import resolvers from "./graphql/resolvers/resolvers.js";
import { connectDb } from "./config/db.js";

dotenv.config({ override: true })

const app = express()

const server = new ApolloServer({
    typeDefs,
    resolvers
})

await server.start()

await connectDb();

app.use(
    '/graphql',
    cors({
        origin: ["https://101490785-comp3133-assignment-deplo.vercel.app", "http://localhost:4200"],
        credentials: true
    }),
    express.json({ limit: '50mb' }),
    expressMiddleware(server, {
        context: async ({ req }) => {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.startsWith('Bearer ') 
                ? authHeader.split(' ')[1] 
                : null;

            if (!token) return { user: null };

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                return { user: decoded };
            } catch (err) {
                return { user: null };
            }
        },
    })
)

export default app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/graphql`);
    });
}