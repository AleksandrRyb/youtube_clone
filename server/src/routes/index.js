import express from "express";

import { getAuthRoutes } from "./auth";

function getRoutes() {
  //All routes in your API are placed in this router
  const router = express.Router();

  //Router.use prefixes our routes like /api/v1
  router.use("/auth", getAuthRoutes());

  return router;
}

export { getRoutes };
