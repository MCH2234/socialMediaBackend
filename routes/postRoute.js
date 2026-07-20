import { Router } from "express";
import passport from "passport";
import * as controller from "../controllers/postController.js";

const post = Router();

post.use(passport.authenticate("jwt", { session: false }));

post.get("/", controller.getPostsOfCurrentUser);
post.post("/", controller.createPost);
post.get("/:postId", controller.getSpecificPost);
post.get("/:postId/comments", controller.getCommentsOfPost);
post.post("/:postId/comments", controller.addComment);

export default post;
