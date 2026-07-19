import { Router } from "express";

const user = Router();

user.get("/", (req, res) => {
  res.send("hello from user");
});

export default user;
