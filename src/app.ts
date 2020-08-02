import * as Koa from "koa";
import * as consola from "consola";
import * as bodyParser from "koa-bodyparser";
// import * as Router from "koa-router";

import { Connection, createConnection, getConnectionOptions } from "typeorm";

import { getOrmConfig } from "./ormconfig";
import { Article, Comment, Role, Image, Upvote, User } from "@/entity/index";
import { makeKoaEntityRouters, setEntityValidatorsDefaultOption } from "@astahmer/entity-routes";
import { testingThings } from "@/functions/testing";
import { logRequest } from "@/middlewares/logRequest";

const logger = consola.default;

declare const module: any;
if (module.hot) {
    module.hot.accept(console.log);
}

/** Creates connection and returns it */
export async function createConnectionToDatabase() {
    const entities = [Article, Comment, Image, Role, Upvote, User];
    const envOptions = await getConnectionOptions();
    const useSqlJS = !process.env.HOST; // if host is defined, using docker
    const options = { ...(useSqlJS ? {} : envOptions), ...(getOrmConfig(useSqlJS) as any), entities };

    return createConnection(options);
}

/** Make app & linsten on given port & return it */
export async function makeApp(connection: Connection) {
    const app = new Koa();
    await connection.synchronize(true);
    logger.info("Starting Koa server...");

    app.use(bodyParser());
    app.use(logRequest(logger));

    //
    testingThings();

    const entities = connection.entityMetadatas.map((meta) => meta.target) as Function[];
    const bridgeRouters = await makeKoaEntityRouters({ connection, entities });
    // Register all routes on koa server
    bridgeRouters.forEach((router) => app.use(router.instance.routes()));

    // Always validate when no groups are passed on validators
    setEntityValidatorsDefaultOption(entities);

    const port = process.env.PORT ? parseInt(process.env.PORT) : undefined;
    const server = app.listen(port, process.env.HOST);
    logger.success("Listening on port " + (port || (server.address() as any).port));

    return server;
}
