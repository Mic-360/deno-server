import { Cookies, type RouterContext } from "https://deno.land/x/oak/mod.ts";
import { db } from "./database/connect.ts";
import { UserSchema } from "./schemas/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { Bson } from "https://deno.land/x/mongo/mod.ts";

const users = db.collection<UserSchema>("users");

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

export const Register = async (ctx: RouterContext) => {
  const { email, password } = await ctx.request.body().value;
  const _id = await users.insertOne({
    email,
    password: await bcrypt.hash(password),
    createdAt: new Date(),
  });
  ctx.response.body = await users.findOne({ _id });
};

export const Login = async (ctx: RouterContext) => {
  const { email, password } = await ctx.request.body().value;
  const user = await users.findOne({ email });
  if (!user) {
    ctx.response.status = 422;
    ctx.response.body = { message: "User not found" };
    return;
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    ctx.response.status = 422;
    ctx.response.body = { message: "Incorrect password" };
    return;
  }

  const jwt = await create(
    { alg: "HS512", typ: "JWT" },
    { _id: user.id },
    key,
  );

  const cookies = new Cookies(ctx);
  cookies.set("jwt", jwt, { httpOnly: true });

  ctx.response.body = user;
};

export const Logout = (ctx: RouterContext) => {
  ctx.cookies.set("jwt", "", { expires: new Date(0) });
  ctx.response.body = {
    message: "Logout successful",
  };
};

export const autheticate = async (ctx: RouterContext) => {
  const jwt = ctx.cookies.get("jwt") || "";

  if (!jwt) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unautheticated" };
    return;
  }

  const payload = await verify(jwt, key) as { _id: string } | null;

  if (!payload) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unautheticated" };
    return;
  }

  const user = await users.findOne({ _id: new Bson.ObjectId(payload?._id) });

  if (!user) {
    ctx.response.status = 422;
    ctx.response.body = { message: "User not found" };
    return;
  }

  ctx.response.body = user;
};
