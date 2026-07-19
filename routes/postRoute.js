import { Router } from "express";
import passport from "passport";
import * as controller from "../controllers/postController.js";

const post = Router();

post.use(passport.authenticate("jwt", { session: false }));

post.get("/", controller.getAllUserPosts);
post.post("/", controller.createPost);
// post.get("/:postId");

export default post;
