import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "../constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "../resolvers/hello";
import { JobResolver } from "../resolvers/job";
import { UserResolver } from "../resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "../types";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginDrainHttpServer,
} from "apollo-server-core";
import cors from "cors";
import { DataSource } from "typeorm";
import { Job } from "../entities/Job";
import { User } from "../entities/User";
import * as dotenv from "dotenv";
import path from "path";
import http from "http";

dotenv.config();

const initializeDatabase = async () => {
  const orm = new DataSource({
    type: "postgres",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: false,
    logging: !__prod__,
    synchronize: !__prod__,
    migrations: [path.join(__dirname, "../migrations/*")],
    entities: [Job, User],
  });

  // (await orm.initialize()).runMigrations();
  await orm.initialize();
};

initializeDatabase();

const app = express();

// redis middleware will run before apollo
// (going to use redis _in_ apollo - so thats important)
const RedisStore = connectRedis(session);
const redis = __prod__
  ? new Redis(
      `rediss://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    )
  : new Redis(+process.env.REDIS_PORT, process.env.REDIS_HOST);
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS!.split(","),
    credentials: true,
  })
);
app.use(
  session({
    name: COOKIE_NAME,
    store: new RedisStore({
      client: redis as any,
      disableTouch: true, // keep user sessions open forever for now, TODO
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true, // browser not able to access session
      sameSite: "lax", // csrf
      secure: __prod__, // cookie only works in https
    },
    saveUninitialized: false, // dont store empty sessions
    secret: process.env.SESSION_SECRET!,
    resave: false,
  })
);

const httpServer = http.createServer(app);

const startApolloServer = async (app: any, httpServer: any) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, JobResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
};

startApolloServer(app, httpServer);

if (__prod__) httpServer.listen(process.env.PORT || 4000);

export default httpServer;
