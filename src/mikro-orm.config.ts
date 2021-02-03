import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { __prod__ } from "./constants";
import {dbName,dbPassword,dbUser} from "./secrets"
import { MikroORM } from "@mikro-orm/core";
import path from "path";
export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post,User],
  type: "postgresql",
  dbName: dbName,
  user: dbUser,
  password: dbPassword,
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
