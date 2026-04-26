import { GoogleSheetsService } from "./googleSheetsService";
import { PrismaService, SyncSource } from "./prismaService";

type SyncFromSheetResult = {
  upserted: number;
  deleted: number;
  skipped: number;
};

export class SyncService {
  private pollingTimer: NodeJS.Timeout | null = null;
  private pollingInFlight = false;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleSheetsService: GoogleSheetsService
  ) {}

  async syncDbToSheet(source: SyncSource = "db"): Promise<{ skipped: boolean; count: number }> {
    if (source === "sheet") {
      return { skipped: true, count: 0 };
    }

    const users = await this.prismaService.getAllUsersDynamic();
    await this.googleSheetsService.writeRowsFromObjects(users);

    console.info("[sync][db->sheet] Synced users", {
      users: users.length,
      sheet: this.googleSheetsService.getSheetName(),
    });

    return { skipped: false, count: users.length };
  }

  async syncSheetToDb(
    rowsFromRequest?: Array<Record<string, unknown>>,
    source: SyncSource = "sheet"
  ): Promise<{ skipped: boolean; result: SyncFromSheetResult }> {
    if (source === "db") {
      return {
        skipped: true,
        result: { upserted: 0, deleted: 0, skipped: 0 },
      };
    }

    const rows = rowsFromRequest ?? (await this.googleSheetsService.readRowsAsObjects());
    const result = await this.prismaService.upsertUsersFromSheet(rows);

    console.info("[sync][sheet->db] Synced sheet rows", {
      rows: rows.length,
      ...result,
    });

    return { skipped: false, result };
  }

  startPolling(intervalMs = 30_000): void {
    this.stopPolling();

    this.pollingTimer = setInterval(async () => {
      if (this.pollingInFlight) {
        return;
      }

      this.pollingInFlight = true;
      try {
        await this.syncSheetToDb(undefined, "sheet");
      } catch (error) {
        console.error("[sync][polling] Sync failed", error);
      } finally {
        this.pollingInFlight = false;
      }
    }, intervalMs);

    console.info("[sync][polling] Started", { intervalMs });
  }

  stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      this.pollingInFlight = false;
      console.info("[sync][polling] Stopped");
    }
  }
}

export type { SyncSource };
