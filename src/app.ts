import * as consola from "consola";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";

import { Connection, createConnection, getConnectionOptions } from "typeorm";

import { getOrmConfig } from "./ormconfig";
import {
    makeKoaEntityRouters,
    setEntityValidatorsDefaultOption,
    BridgeRouter,
    flatMap,
    prop,
    BridgeRouterRoute,
    last,
} from "@astahmer/entity-routes";
import { logRequest } from "@/middlewares/logRequest";
import Server from "next/dist/next-server/server/next-server";
import { getEntities } from "./entities";

const logger = consola.default;

/** Creates connection and returns it */
export async function createConnectionToDatabase() {
    const entities = getEntities();
    const envOptions = await getConnectionOptions();
    const useSqlJS = !process.env.HOST; // if host is defined, using docker
    const options = { ...(useSqlJS ? {} : envOptions), ...(getOrmConfig(useSqlJS) as any), entities };

    return createConnection(options);
}

/** Make app & listen on given port & return it */
export async function makeApp(connection: Connection, nextApp: Server) {
    const app = new Koa();
    await connection.synchronize(true);
    logger.info("Starting Koa server...");

    app.use(bodyParser());
    app.use(logRequest(logger));

    const entities = connection.entityMetadatas.map((meta) => meta.target) as Function[];
    const bridgeRouters = await makeKoaEntityRouters({ connection, entities });

    // Register all routes on koa server
    const apiRouter = new Router({ prefix: "/entity-routes" });

    const routesList = getGeneratedRoutesList(bridgeRouters);
    const routeNames = routesList.map((route) => route.name);

    apiRouter.get("/", async (ctx) => {
        ctx.body = routeNames;
    });
    bridgeRouters.forEach((router) => apiRouter.use(router.instance.routes()));
    app.use(apiRouter.routes());

    // Register custom next routes
    const router = new Router();
    // Redirect /a to b.tsx
    router.get("/a", async (ctx) => {
        await nextApp.render(ctx.req, ctx.res, "/b", ctx.query);
        ctx.respond = false;
    });

    // Redirect /b to a.tsx
    router.get("/b", async (ctx) => {
        await nextApp.render(ctx.req, ctx.res, "/a", ctx.query);
        ctx.respond = false;
    });

    // Register /c -> c.tsx
    router.all("(.*)", async (ctx) => {
        await nextApp.getRequestHandler()(ctx.req, ctx.res);
        ctx.respond = false;
    });
    app.use(router.routes());

    // Always validate when no groups are passed on validators
    setEntityValidatorsDefaultOption(entities);

    const port = process.env.PORT ? parseInt(process.env.PORT) : undefined;
    const server = app.listen(port, process.env.HOST);
    logger.success("Listening on port " + (port || (server.address() as any).port));

    return server;
}

function getGeneratedRoutesList(bridgeRouters: BridgeRouter<Router>[]) {
    const routes = flatMap(bridgeRouters.map(prop("routes"))) as BridgeRouterRoute[];
    return routes.map(({ methods, path, name }) => ({ verb: last(methods).toUpperCase(), path, name }));
}
