import { PrismaClient } from '../../generated/prisma';
declare const prisma: PrismaClient<{
    log: ("info" | "error" | "query" | "warn")[];
    errorFormat: "pretty";
}, "info" | "error" | "query" | "warn", import("generated/prisma/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=database.d.ts.map