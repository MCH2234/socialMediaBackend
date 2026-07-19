import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
const { sign } = jwt;

const signup = async (req, res) => {
  const user = req.body.user;
  const password = req.body.password;
  const first = req.body.first;
  const last = req.body.last;
  const findUser = await prisma.user.findFirst({
    where: {
      user: user,
    },
    select: {
      user: true,
    },
  });
  if (findUser !== null) {
    if (findUser.user === user) {
      return res.json({
        message: "User already exists",
      });
    }
  } else {
    const createUser = await prisma.user.create({
      data: {
        user: user,
        password: await bcrypt.hash(password, 10),
        first: first,
        last: last,
      },
    });
    if (createUser !== null) {
      return res.json({
        message: "User created successfuly",
      });
    }
  }
};

const login = async (req, res) => {
  const user = req.body.user;
  const password = req.body.password;

  const findUser = await prisma.user.findFirst({
    where: {
      user: user,
    },
    select: {
      id: true,
      user: true,
      password: true,
    },
  });

  if (findUser !== null) {
    const verifyPassword = await bcrypt.compare(password, findUser.password);
    if (verifyPassword === true) {
      sign(
        {
          id: findUser.id,
        },
        process.env.jwt_secret,
        (err, token) => {
          return res.json({
            token: token,
          });
        },
      );
    } else {
      res.json({
        message: "Invalid user or password",
      });
    }
  } else {
    res.json({ message: "Invalid user or password" });
  }
};

export { login, signup };
