import express, { urlencoded } from "express";
import * as route from "./routes/exporter.js";
import prisma from "./lib/prisma.js";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-jwt";
import cors from "cors";
import passport from "passport";
const app = express();
const PORT = parseInt(process.env.PORT);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: [process.env.DEV_URL, process.env.PROD_URL] }));

app.use("/api/v1/auth", route.auth);
app.use("/api/v1/user", route.user);
app.use("/api/v1/post", route.post);
app.use("/api/v1/comment", route.comment);

passport.use(
  new Strategy(
    {
      secretOrKey: process.env.jwt_secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (decodedToken, done) => {
      const user = await prisma.user.findFirst({
        where: {
          id: decodedToken.id,
        },
      });
      if (user !== null) {
        done(null, user);
      } else {
        done(null, false);
      }
    },
  ),
);

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error", err);
  }
  console.log("Server listening on port", PORT);
});
