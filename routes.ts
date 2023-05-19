import { Router } from "https://deno.land/x/oak/mod.ts";
import { autheticate, Login, Logout, Register } from "./controller.ts";

const router = new Router();

router.post("/", Register)
  .post("/login", Login)
  .post("/logout", Logout)
  .get("/login", autheticate);

export default router;
