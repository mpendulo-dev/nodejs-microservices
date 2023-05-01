import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "./entity/Product";

export const AppDataSource = new DataSource({
    type: "mongodb",
    host: "localhost",
    port: 27017,
    database: "main",
    synchronize: true,
    logging: false,
    entities: [Product],
    migrations: [],
    subscribers: [],
});
