import express from "express";

import { getAuthRoutes } from "./auth";
import { getVideoRoutes } from "./video";
import { getUserRoutes } from "./user";

function getRoutes() {
  //All routes in your API are placed in this router
  const router = express.Router();

  //Router.use prefixes our routes like /api/v1
  router.use("/auth", getAuthRoutes());
  router.use("/videos", getVideoRoutes());
  router.use("/user", getUserRoutes());

  return router;
}

export { getRoutes };
