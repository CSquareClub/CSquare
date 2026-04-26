import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { GoogleSheetsService } from "./googleSheetsService";
import { PrismaService } from "./prismaService";
import { SyncService, SyncSource } from "./syncService";
import { isGoogleServiceAccountConfigured } from "../../lib/google-service-account";

type RequestWithSource = {
  source?: SyncSource;
};

type RequestWithApiKey = {
  apiKey?: string;
};

type SyncBackendAvailability = {
  databaseConfigured: boolean;
  spreadsheetConfigured: boolean;
  googleServiceAccountConfigured: boolean;
  ready: boolean;
  missing: string[];
};

function parseSource(source: unknown): SyncSource {
  return source === "sheet" ? "sheet" : "db";
}

function parseId(idRaw: string): number {
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    throw new Error("Invalid id parameter");
  }
  return Math.trunc(id);
}

function getConfiguredApiKey(): string | null {
  const apiKey = process.env.SYNC_BACKEND_API_KEY?.trim();
  return apiKey ? apiKey : null;
}

function isAuthorizedApiKey(providedKey: string | undefined, configuredKey: string | null): boolean {
  if (!configuredKey) {
    return true;
  }

  return Boolean(providedKey) && providedKey === configuredKey;
}

function getSyncBackendAvailability(): SyncBackendAvailability {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const spreadsheetConfigured = Boolean(process.env.GOOGLE_SYNC_SPREADSHEET_ID);
  const googleServiceAccountConfigured = isGoogleServiceAccountConfigured();

  const missing: string[] = [];

  if (!databaseConfigured) missing.push("DATABASE_URL");
  if (!spreadsheetConfigured) missing.push("GOOGLE_SYNC_SPREADSHEET_ID");
  if (!googleServiceAccountConfigured) {
    missing.push("Google service account credentials");
  }

  return {
    databaseConfigured,
    spreadsheetConfigured,
    googleServiceAccountConfigured,
    ready: missing.length === 0,
    missing,
  };
}

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  const availability = getSyncBackendAvailability();
  const configuredApiKey = getConfiguredApiKey();

  let prismaService: PrismaService | null = null;
  let syncService: SyncService | null = null;

  if (availability.ready) {
    try {
      prismaService = new PrismaService();
      syncService = new SyncService(prismaService, new GoogleSheetsService());

      const pollInterval = Number(process.env.SYNC_POLL_INTERVAL_MS || "30000");
      syncService.startPolling(Number.isFinite(pollInterval) ? pollInterval : 30_000);
    } catch (error) {
      console.error("[sync][server] Sync services failed to initialize", error);
      prismaService = null;
      syncService = null;
    }
  } else {
    console.warn("[sync][server] Starting without sync services", {
      missing: availability.missing,
    });
  }

  function requireSyncService(res: Response): SyncService | null {
    if (syncService) {
      return syncService;
    }

    res.status(503).json({
      error: "Sync backend is not fully configured.",
      missing: availability.missing,
      ready: false,
    });

    return null;
  }

  function requireApiKey(req: Request, res: Response): boolean {
    if (!configuredApiKey) {
      return true;
    }

    const body = req.body as RequestWithApiKey | undefined;
    const headerKey = req.header("x-sync-api-key");
    const providedKey = body?.apiKey || headerKey || undefined;

    if (isAuthorizedApiKey(providedKey, configuredApiKey)) {
      return true;
    }

    res.status(401).json({
      error: "Unauthorized sync request.",
    });
    return false;
  }

  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: "sheet-db-sync",
      syncReady: availability.ready,
      missing: availability.missing,
    });
  });

  app.get("/users", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const service = requireSyncService(res);
      if (!service || !prismaService) {
        return;
      }

      const users = await prismaService.getAllUsersDynamic();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  });

  app.post("/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireApiKey(req, res)) {
        return;
      }

      const service = requireSyncService(res);
      if (!service || !prismaService) {
        return;
      }

      const body = req.body as { data?: Record<string, unknown> } & RequestWithSource;
      const user = await prismaService.createUserDynamic(body.data || {});
      const sync = await service.syncDbToSheet(parseSource(body.source));
      res.status(201).json({ user, sync });
    } catch (error) {
      next(error);
    }
  });

  app.put("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireApiKey(req, res)) {
        return;
      }

      const service = requireSyncService(res);
      if (!service || !prismaService) {
        return;
      }

      const id = parseId(req.params.id);
      const body = req.body as { data?: Record<string, unknown> } & RequestWithSource;
      const user = await prismaService.updateUserDynamic(id, body.data || {});
      const sync = await service.syncDbToSheet(parseSource(body.source));
      res.json({ user, sync });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireApiKey(req, res)) {
        return;
      }

      const service = requireSyncService(res);
      if (!service || !prismaService) {
        return;
      }

      const id = parseId(req.params.id);
      const body = (req.body || {}) as RequestWithSource;

      await prismaService.deleteUser(id);
      const sync = await service.syncDbToSheet(parseSource(body.source));

      res.json({ deleted: true, sync });
    } catch (error) {
      next(error);
    }
  });

  app.post("/sync-to-sheet", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireApiKey(req, res)) {
        return;
      }

      const service = requireSyncService(res);
      if (!service) {
        return;
      }

      const body = (req.body || {}) as RequestWithSource;
      const sync = await service.syncDbToSheet(parseSource(body.source));
      res.json(sync);
    } catch (error) {
      next(error);
    }
  });

  app.post("/sync-from-sheet", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireApiKey(req, res)) {
        return;
      }

      const service = requireSyncService(res);
      if (!service || !prismaService) {
        return;
      }

      const body = (req.body || {}) as {
        rows?: Array<Record<string, unknown>>;
      } & RequestWithSource;

      const sync = await service.syncSheetToDb(body.rows, parseSource(body.source));
      res.json(sync);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[sync][server] Request failed", error);
    res.status(500).json({ error: message });
  });

  const port = Number(process.env.SYNC_BACKEND_PORT || "4000");
  const server = app.listen(port, () => {
    console.info(`[sync][server] Listening on http://localhost:${port}`);
  });

  const shutdown = async () => {
    console.info("[sync][server] Shutting down");
    syncService?.stopPolling();
    server.close();
    if (prismaService) {
      await prismaService.disconnect();
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("[sync][server] Failed to bootstrap", error);
  process.exit(1);
});
