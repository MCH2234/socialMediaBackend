import { Router } from "express";
import passport from "passport";
import * as controller from "../controllers/postController.js";

const post = Router();

post.use(passport.authenticate("jwt", { session: false }));

post.get("/", controller.getPostsOfCurrentUser);
post.post("/", controller.createPost);
post.get("/all", controller.getPosts);
// post.get("/likes/:postId", controller.getPostLikes);
post.post("/like/:postId", controller.likePost);
post.delete("/like/:postId", controller.unlikePost);
post.get("/follow", controller.getPostsOfUsersCurrentUserFollows);
post.get("/:postId", controller.getSpecificPost);
post.put("/:postId", controller.editPost);
post.delete("/:postId", controller.deletePost);
post.get("/:postId/comments", controller.getCommentsOfPost);
post.post("/:postId/comments", controller.addComment);

export default post;
