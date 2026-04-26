import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../lib/generated/prisma/client";

export type SyncSource = "db" | "sheet";

type UserRow = Record<string, unknown>;

type UserTableColumn = {
  columnName: string;
  dataType: string;
  udtName: string;
  isNullable: "YES" | "NO";
};

type UpsertStats = {
  upserted: number;
  deleted: number;
  skipped: number;
};

export class PrismaService {
  private readonly prisma: PrismaClient;
  private userColumnsCache: UserTableColumn[] | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    const adapter = new PrismaPg({ connectionString });
    this.prisma = new PrismaClient({ adapter });
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async getAllUsersDynamic(): Promise<UserRow[]> {
    const users = (await this.prisma.user.findMany({
      orderBy: { id: "asc" },
    })) as unknown as UserRow[];

    return users.map((user) => this.serializeRecord(user));
  }

  async createUserDynamic(data: UserRow): Promise<UserRow> {
    const columns = await this.getUserColumns();
    const sanitized = this.sanitizeForUserWrite(data, columns, "create");

    const created = (await this.prisma.user.create({
      data: sanitized,
    })) as unknown as UserRow;

    return this.serializeRecord(created);
  }

  async updateUserDynamic(id: number, data: UserRow): Promise<UserRow> {
    const columns = await this.getUserColumns();
    const sanitized = this.sanitizeForUserWrite(data, columns, "update");

    const updated = (await this.prisma.user.update({
      where: { id },
      data: sanitized,
    })) as unknown as UserRow;

    return this.serializeRecord(updated);
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async upsertUsersFromSheet(rows: UserRow[]): Promise<UpsertStats> {
    const columns = await this.getUserColumns();
    const columnNames = new Set(columns.map((col) => col.columnName));

    let upserted = 0;
    let skipped = 0;

    const seenIds = new Set<number>();
    const seenEmails = new Set<string>();

    for (const row of rows) {
      const sanitized = this.sanitizeForUserWrite(row, columns, "upsert");
      const id = this.coerceId(sanitized.id);
      const email = typeof sanitized.email === "string" && sanitized.email.trim() ? sanitized.email.trim() : null;

      if (typeof id === "number") {
        seenIds.add(id);
      }

      if (email) {
        seenEmails.add(email);
      }

      if (typeof id !== "number" && !email) {
        skipped += 1;
        continue;
      }

      const createData = { ...sanitized };
      const updateData = { ...sanitized };

      // id should never be part of update payload.
      delete updateData.id;

      try {
        if (typeof id === "number") {
          await this.prisma.user.upsert({
            where: { id },
            create: createData,
            update: updateData,
          });
          upserted += 1;
          continue;
        }

        await this.prisma.user.upsert({
          where: { email: email as string },
          create: createData,
          update: updateData,
        });
        upserted += 1;
      } catch (error) {
        skipped += 1;
        console.error("[sync][prisma] Failed to upsert row", { row, error });
      }
    }

    let deleted = 0;

    if (rows.length === 0) {
      deleted = await this.prisma.user.deleteMany().then((res) => res.count);
    } else if (seenIds.size > 0 || seenEmails.size > 0) {
      const existingUsers = await this.prisma.user.findMany({
        select: { id: true, email: true },
      });

      const staleIds = existingUsers
        .filter((user) => !seenIds.has(user.id) && !seenEmails.has(user.email))
        .map((user) => user.id);

      if (staleIds.length > 0) {
        deleted = await this.prisma.user.deleteMany({
          where: { id: { in: staleIds } },
        }).then((res) => res.count);
      }
    } else {
      console.warn("[sync][prisma] Skipped delete phase because sheet rows had no usable id/email identifiers.");
    }

    // Keep function future-proof in case user table shape evolves.
    if (!columnNames.has("updatedAt")) {
      console.warn("[sync][prisma] User.updatedAt column was not detected in table metadata.");
    }

    return { upserted, deleted, skipped };
  }

  async getUserColumns(): Promise<UserTableColumn[]> {
    if (this.userColumnsCache) {
      return this.userColumnsCache;
    }

    const columns = await this.prisma.$queryRawUnsafe<UserTableColumn[]>(`
      SELECT
        column_name AS "columnName",
        data_type AS "dataType",
        udt_name AS "udtName",
        is_nullable AS "isNullable"
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
      ORDER BY ordinal_position ASC;
    `);

    this.userColumnsCache = columns;
    return columns;
  }

  private sanitizeForUserWrite(
    input: UserRow,
    columns: UserTableColumn[],
    mode: "create" | "update" | "upsert"
  ): UserRow {
    const byColumn = new Map(columns.map((col) => [col.columnName, col]));
    const output: UserRow = {};

    for (const [key, rawValue] of Object.entries(input ?? {})) {
      const column = byColumn.get(key);
      if (!column) {
        continue;
      }

      const coerced = this.coerceByColumn(rawValue, column);

      if (typeof coerced === "undefined") {
        continue;
      }

      // updatedAt is managed by Prisma and should not be manually set from sheet payloads.
      if (key === "updatedAt" && mode !== "create") {
        continue;
      }

      output[key] = coerced;
    }

    return output;
  }

  private coerceByColumn(value: unknown, column: UserTableColumn): unknown {
    if (value === null) {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed.length) {
        return column.isNullable === "YES" ? null : undefined;
      }
      value = trimmed;
    }

    const type = column.dataType.toLowerCase();

    if (type.includes("timestamp") || type === "date") {
      const dateValue = value instanceof Date ? value : new Date(String(value));
      return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
    }

    if (type === "integer" || type === "bigint" || column.udtName === "int4" || column.udtName === "int8") {
      const numberValue = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numberValue) ? numberValue : undefined;
    }

    if (type === "boolean" || column.udtName === "bool") {
      if (typeof value === "boolean") {
        return value;
      }

      const normalized = String(value).toLowerCase();
      if (["true", "1", "yes", "y"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "no", "n"].includes(normalized)) {
        return false;
      }
      return undefined;
    }

    if (type === "json" || type === "jsonb" || column.udtName === "json" || column.udtName === "jsonb") {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    }

    return value;
  }

  private coerceId(value: unknown): number | null {
    const numberValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numberValue)) {
      return null;
    }

    return Math.trunc(numberValue);
  }

  private serializeRecord(record: UserRow): UserRow {
    return Object.fromEntries(
      Object.entries(record).map(([key, value]) => {
        if (value instanceof Date) {
          return [key, value.toISOString()];
        }
        return [key, value];
      })
    );
  }
}
