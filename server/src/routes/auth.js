import express from "express";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import { protect } from "../middlewares/authorization";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const prisma = new PrismaClient();

function getAuthRoutes() {
  const router = express.Router();

  router.post("/google-signin", googleSignIn);
  router.get("/me", protect, me);
  router.get("/signout", signout);

  return router;
}

async function googleSignIn(req, res) {
  const { idToken } = req.body;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { name, picture, email } = ticket.getPayload();

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: name,
        avatar: picture,
        email,
      },
    });
  }

  const tokenPayload = { id: user.id };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("token", token, { httpOnly: true });
  res.status(200).send(token);
}

async function me(req, res) {
  res.status(200).json({
    user: req.user,
  });
}

async function signout(req, res) {
  res.clearCookie("token");
  res.status(200).json({});
}

export { getAuthRoutes };
