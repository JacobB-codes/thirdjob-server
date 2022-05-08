"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("../constants");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("../resolvers/hello");
const job_1 = require("../resolvers/job");
const user_1 = require("../resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const apollo_server_core_1 = require("apollo-server-core");
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const Job_1 = require("../entities/Job");
const User_1 = require("../entities/User");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
dotenv.config();
const initializeDatabase = async () => {
    const orm = new typeorm_1.DataSource({
        type: "postgres",
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        ssl: constants_1.__prod__,
        logging: !constants_1.__prod__,
        synchronize: !constants_1.__prod__,
        migrations: [path_1.default.join(__dirname, "../migrations/*")],
        entities: [Job_1.Job, User_1.User],
    });
    await orm.initialize();
};
initializeDatabase();
const app = (0, express_1.default)();
const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
const redis = new ioredis_1.default(`rediss://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
}));
app.use((0, express_session_1.default)({
    name: constants_1.COOKIE_NAME,
    store: new RedisStore({
        client: redis,
        disableTouch: true,
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
        secure: constants_1.__prod__,
    },
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
}));
const httpServer = http_1.default.createServer(app);
const startApolloServer = async (app, httpServer) => {
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, job_1.JobResolver, user_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
            (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
        ],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
};
startApolloServer(app, httpServer);
exports.default = httpServer;
//# sourceMappingURL=index.js.map