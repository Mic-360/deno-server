import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import router from "./routes.ts";

const app = new Application();
const PORT = 8081;

app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors({
    credentials: true,
    origin: /^.+localhost:(5173|3000|8080)$/,
    optionsSuccessStatus: 200,
}));

console.log(`Server running on port ${PORT}`);

await app.listen({ port: PORT });
