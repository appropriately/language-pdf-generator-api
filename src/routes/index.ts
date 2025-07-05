import { Router } from "express";
import { ResponseStandardizer } from "../utils/responseStandardizer";

const router = Router();

router.get("/", (_req, res) => {
  ResponseStandardizer.success(
    res,
    {
      name: "Language PDF Generator API",
      version: process.env.npm_package_version,
    },
    "API is running"
  );
});

export default router;
