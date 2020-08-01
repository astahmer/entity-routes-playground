import { Context, Next } from "koa";

interface Logger {
    error(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    log(message?: any, ...optionalParams: any[]): void;
    debug(message?: any, ...optionalParams: any[]): void;
}

export function logRequest(logger: Logger) {
    return async (ctx: Context, next: Next) => {
        const start = Date.now();
        const message = `[${ctx.status}] ${ctx.method} ${ctx.path}`;

        try {
            await next();
            const suffix = ` (${Date.now() - start}ms)`;

            if (ctx.status >= 400) {
                logger.error(message + suffix);
            } else {
                logger.info(message + suffix);
            }
        } catch (error) {
            const suffix = ` (${Date.now() - start}ms)`;
            logger.error(message + suffix + " " + error.message);
        }
    };
}
