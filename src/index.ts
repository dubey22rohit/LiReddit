import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { redisSecret } from './secrets'
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
let RedisStore = connectRedis(session)
let redisClient = redis.createClient()


const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();
  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__
      },
      saveUninitialized : false,
      secret: redisSecret,
      resave: false,
    })
  )
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req,res}) => ({ em: orm.em ,req,res}),
  });
  const PORT = 4000
  apolloServer.applyMiddleware({ app });
  app.listen(PORT, () =>
    console.log(`server started on http://localhost:${PORT}`)
  );
};

main();
