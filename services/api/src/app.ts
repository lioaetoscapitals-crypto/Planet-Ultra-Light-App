import cors from "cors";
import express from "express";
import { authMiddleware, errorHandler } from "./shared/http.js";
import { authRouter } from "./modules/auth/routes.js";
import { usersRouter } from "./modules/users/routes.js";
import { apartmentsRouter } from "./modules/apartments/routes.js";
import { gateRouter } from "./modules/gate/routes.js";
import { invitationsRouter } from "./modules/invitations/routes.js";
import { bookingsRouter } from "./modules/bookings/routes.js";
import { noticesRouter } from "./modules/notices/routes.js";
import { marketRouter } from "./modules/market/routes.js";
import { residentSystemRouter } from "./modules/resident-system/routes.js";
import { onboardingRouter } from "./modules/onboarding/routes.js";

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "planet-ultra-api" });
  });

  app.use("/v1/auth", authRouter);
  app.use(authMiddleware);
  app.use("/v1/users", usersRouter);
  app.use("/v1/apartments", apartmentsRouter);
  app.use("/v1/gate-logs", gateRouter);
  app.use("/v1/invitations", invitationsRouter);
  app.use("/v1/bookings", bookingsRouter);
  app.use("/v1/notices", noticesRouter);
  app.use("/v1/market-items", marketRouter);
  app.use("/v1", onboardingRouter);

  // Resident Management API surface (new flow).
  app.use("/api/v1", residentSystemRouter);
  // Compatibility mount so backoffice can read visitor entries via /v1 as well.
  app.use("/v1", residentSystemRouter);

  app.use(errorHandler);

  return app;
};
