import { Middleware } from "koa";
import Router from "koa-router";
import { RouteVerb } from "@astahmer/entity-routes";

export type RouteActionConfig = {
    /** Route name */
    name?: string;
    /** Route path for this action */
    path: string;
    /** HTTP verb for this action */
    verb: RouteVerb;
    /** Koa middleware that handles this route response */
    handler?: Middleware;
};

export function makeRouterFromConfigs(actions: RouteActionConfig[]) {
    const router = new Router();
    actions.forEach(({ name, verb, path, handler }) => router.register(path, [verb], handler, { name }));
    return router;
}
