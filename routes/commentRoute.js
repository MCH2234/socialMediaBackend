import * as controller from "../controllers/commentController.js";
import { Router } from "express";
import passport from "passport";

const comment = Router();

comment.use(passport.authenticate("jwt", { session: false }));

comment.get("/", controller.getAllComments);
comment.get("/:commentId", controller.getSpecificComment);

export default comment;
