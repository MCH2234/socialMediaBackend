import { Router } from "express";
import passport from "passport";
import * as controller from "../controllers/userController.js";

const user = Router();

user.use(passport.authenticate("jwt", { session: false }));

user.get("/:userId", controller.userInfo); /// development only
user.get("/followers", controller.getUserFollowers);
user.get("/following", controller.getWhoTheUserFollows);
user.get("/follow/request", controller.getFollowRequests);
user.post("/follow/request/:userId", controller.sendfollowRequest);
user.post("/follow/:requestId", controller.followUser);
user.delete("/follow/:userId", controller.unfollowUser);

export default user;
