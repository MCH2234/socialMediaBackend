import * as controller from "../controllers/commentController.js";
import { Router } from "express";
import passport from "passport";

const comment = Router();

comment.use(passport.authenticate("jwt", { session: false }));

comment.get("/", controller.getAllComments);
comment.get("/:commentId", controller.getSpecificComment);
comment.post("/:commentId", controller.validateAndReplyToComment);
comment.put("/:commentId", controller.editComment);
comment.delete("/:commentId", controller.deleteComment);
comment.get("/replies/:parentId", controller.getRepliesOfComment);
comment.post("/like/:commentId", controller.likeComment);
comment.delete("/like/:commentId", controller.unlikeComment);

export default comment;
