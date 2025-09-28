// src/routes/index.js
import { Router } from "express";
import { readdirSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const router = Router();

// ✅ หาโฟลเดอร์ของไฟล์นี้แบบ cross-platform
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routesDir = __dirname;

// ✅ ดึงทุกไฟล์ *.routes.js ในโฟลเดอร์นี้
const files = readdirSync(routesDir).filter((f) => f.endsWith(".routes.js"));

for (const file of files) {
  // ใช้ file URL เพื่อกันปัญหา backslash บน Windows
  const modUrl = pathToFileURL(join(routesDir, file)).href;
  const mod = await import(modUrl);

  if (!mod?.default) {
    console.warn(`[routes] Skip ${file}: no default export (Router)`);
    continue;
  }

  // แปลงชื่อไฟล์เป็น prefix
  // auth.routes.js        -> /api/auth
  // kpiUpdate.routes.js   -> /api/kpi-update  (camelCase -> kebab)
  const nameRaw = basename(file, ".routes.js").replace(".routes", "");
 
  const prefix = nameRaw;
  const mountPath = `/api/${prefix}`;
  router.use(mountPath, mod.default);
  console.log(`✓ Mounted ${file} at ${mountPath}`);
}

export default router;
