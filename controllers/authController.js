import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { validationResult, body } from "express-validator";
const { sign } = jwt;

const signupValidation = [
  body("user")
    .trim()
    .not()
    .isEmpty()
    .withMessage("User field can't be empty")
    .isLength({ min: 3, max: 15 })
    .withMessage("Username has to be between 3 and 15 characters")
    .matches(/^\S+$/)
    .withMessage("Username can't contain whitespace"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password field can't be empty")
    .isLength({ min: 6, max: 15 })
    .withMessage("Password has to be between 6 and 15 characters"),
  body("first")
    .trim()
    .not()
    .isEmpty()
    .withMessage("First name field can't be empty")
    .matches(/^\S+$/)
    .withMessage("First name can't contain whitespace"),
  body("last")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Last name field can't be empty")
    .matches(/^\S+$/)
    .withMessage("Last name can't contain whitespace"),
  ,
  async (req, res) => {
    const valErrors = validationResult(req);
    if (valErrors.isEmpty() === false) {
      const clientErrors = [];
      valErrors.array().forEach((err) => {
        clientErrors.push(err.msg);
      });
      return res.status(409).json({
        error: clientErrors,
      });
    }
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
        return res.status(409).json({
          error: ["User already exists"],
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
        return res.status(201).json({
          message: "User created successfuly",
        });
      }
    }
  },
];

const loginValidation = [
  body("user")
    .trim()
    .not()
    .isEmpty()
    .withMessage("User field can't be empty")
    .isLength({ min: 3, max: 15 })
    .withMessage("Username has to be between 3 and 15 characters"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password field can't be empty")
    .isLength({ min: 6, max: 15 })
    .withMessage("Password has to be between 6 and 15 characters"),

  async (req, res) => {
    const valErrors = validationResult(req);
    if (valErrors.isEmpty() === false) {
      const errorMsg = [];
      valErrors.array().forEach((err) => errorMsg.push(err.msg));
      return res.status(409).json({ error: errorMsg });
    }
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
            return res.status(200).json({
              token: token,
            });
          },
        );
      } else {
        res.status(409).json({
          error: ["Invalid user or password"],
        });
      }
    } else {
      res.status(409).json({ error: ["Invalid user or password"] });
    }
  },
];

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
      return res.status(409).json({
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
      return res.status(201).json({
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

const logout = (req, res) => {
  if (req.user) {
    req.logOut(() => res.json({ message: "Logout" }));
  } else {
    res.status(409).json({
      message: "Action not permitted",
    });
  }
};

export { loginValidation, signupValidation, logout };
