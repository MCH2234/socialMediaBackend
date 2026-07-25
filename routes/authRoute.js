import { Router } from "express";
import * as controller from "../controllers/authController.js";
import passport from "passport";

const auth = Router();

auth.post("/signup", controller.signupValidation);
auth.post("/login", controller.loginValidation);
auth.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  controller.logout,
);

export default auth;
