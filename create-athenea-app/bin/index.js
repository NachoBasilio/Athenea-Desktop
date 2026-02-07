#!/usr/bin/env node

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { spawn } from "node:child_process";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function printHelp() {
  console.log(
    [
      "create-athenea-app",
      "",
      "Uso:",
      "  npm create athenea-app@latest [nombre]",
      "",
      "Opciones:",
      "  --no-install   No ejecuta npm install",
      "  --help         Muestra esta ayuda",
    ].join("\n"),
  );
}

function slugify(inputText) {
  const s = String(inputText)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return s;
}

function assertEmptyDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath);
  if (entries.length > 0) {
    throw new Error(`La carpeta ya existe y no esta vacia: ${dirPath}`);
  }
}

async function replaceTokensInFile(filePath, tokenMap) {
  let content = await fsp.readFile(filePath, "utf8");
  for (const [token, value] of Object.entries(tokenMap)) {
    content = content.split(token).join(value);
  }
  await fsp.writeFile(filePath, content, "utf8");
}

async function updateAppPackageJson(
  projectDir,
  { npmName, productName, appId },
) {
  const pkgPath = path.join(projectDir, "package.json");
  const raw = await fsp.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(raw);

  pkg.name = npmName;
  if (typeof pkg.version !== "string") pkg.version = "0.1.0";

  if (!pkg.build || typeof pkg.build !== "object") pkg.build = {};
  pkg.build.productName = productName;
  pkg.build.appId = appId;

  await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

// ---------- Asset generator (white placeholders) ----------
function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ -1) >>> 0;
}

function pngSolidRGBA(width, height, r, g, b, a) {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, "ascii");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const row = Buffer.alloc(1 + width * 4);
  row[0] = 0; // filter type 0
  for (let x = 0; x < width; x++) {
    const o = 1 + x * 4;
    row[o + 0] = r;
    row[o + 1] = g;
    row[o + 2] = b;
    row[o + 3] = a;
  }

  const raw = Buffer.alloc(row.length * height);
  for (let y = 0; y < height; y++) row.copy(raw, y * row.length);

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdrData),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function icoFromPng(pngBuf, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type icon
  header.writeUInt16LE(1, 4); // count

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // width
  entry.writeUInt8(size === 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuf.length, 8); // bytes in res
  entry.writeUInt32LE(6 + 16, 12); // offset

  return Buffer.concat([header, entry, pngBuf]);
}

function bmpSolid24(width, height, r, g, b) {
  const rowSize = (width * 3 + 3) & ~3; // 4-byte aligned
  const pixelDataSize = rowSize * height;
  const fileSize = 14 + 40 + pixelDataSize;

  const fileHeader = Buffer.alloc(14);
  fileHeader.write("BM", 0, 2, "ascii");
  fileHeader.writeUInt32LE(fileSize, 2);
  fileHeader.writeUInt32LE(0, 6);
  fileHeader.writeUInt32LE(14 + 40, 10);

  const dib = Buffer.alloc(40);
  dib.writeUInt32LE(40, 0); // header size
  dib.writeInt32LE(width, 4);
  dib.writeInt32LE(height, 8); // bottom-up
  dib.writeUInt16LE(1, 12); // planes
  dib.writeUInt16LE(24, 14); // bpp
  dib.writeUInt32LE(0, 16); // BI_RGB
  dib.writeUInt32LE(pixelDataSize, 20);
  dib.writeInt32LE(2835, 24); // 72 DPI
  dib.writeInt32LE(2835, 28);
  dib.writeUInt32LE(0, 32);
  dib.writeUInt32LE(0, 36);

  const pixels = Buffer.alloc(pixelDataSize);
  for (let y = 0; y < height; y++) {
    const rowOff = y * rowSize;
    for (let x = 0; x < width; x++) {
      const o = rowOff + x * 3;
      pixels[o + 0] = b;
      pixels[o + 1] = g;
      pixels[o + 2] = r;
    }
    // padding queda en 0
  }

  return Buffer.concat([fileHeader, dib, pixels]);
}

async function ensureBuildAssets(projectDir) {
  // electron-vite usa "resources" como directorio de assets para main/preload
  const resourcesDir = path.join(projectDir, "resources");
  await fsp.mkdir(resourcesDir, { recursive: true });

  const png256 = pngSolidRGBA(256, 256, 255, 255, 255, 255);
  const ico = icoFromPng(png256, 256);

  // PNG para Linux, ICO para Windows
  await fsp.writeFile(path.join(resourcesDir, "icon.png"), png256);
  await fsp.writeFile(path.join(resourcesDir, "icon.ico"), ico);

  await fsp.writeFile(
    path.join(resourcesDir, "installer-sidebar.bmp"),
    bmpSolid24(164, 314, 255, 255, 255),
  );
  await fsp.writeFile(
    path.join(resourcesDir, "installer-header.bmp"),
    bmpSolid24(150, 57, 255, 255, 255),
  );
}

async function npmInstall(projectDir) {
  const isWin = process.platform === "win32";
  const npmCmd = isWin ? "npm.cmd" : "npm";

  await new Promise((resolve, reject) => {
    const child = spawn(npmCmd, ["install"], {
      cwd: projectDir,
      stdio: "inherit",
      shell: isWin,
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm install fallo con codigo ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const noInstall = args.includes("--no-install");
  const nameArg = args.find((a) => a && !a.startsWith("-"));

  let projectName = nameArg;
  if (!projectName) {
    const rl = createInterface({ input, output });
    projectName = (await rl.question("Nombre del proyecto: ")).trim();
    await rl.close();
  }

  if (!projectName) {
    console.error("Nombre requerido.");
    process.exit(1);
  }

  const productName = projectName.trim();
  const npmName = slugify(productName);
  if (!npmName) {
    console.error("Nombre invalido: no se pudo generar un nombre de paquete.");
    process.exit(1);
  }

  const appId = `com.example.${npmName}`;
  const targetDir = path.resolve(process.cwd(), npmName);
  assertEmptyDir(targetDir);

  const templateDir = path.resolve(__dirname, "..", "template");
  await fsp.mkdir(targetDir, { recursive: true });
  await fsp.cp(templateDir, targetDir, { recursive: true });

  await updateAppPackageJson(targetDir, { npmName, productName, appId });

  const tokenMap = {
    __APP_TITLE__: productName,
    __APP_TITLE_JSON__: JSON.stringify(productName),
    __APP_APP_ID__: appId,
  };

  // Reemplazar tokens en los archivos correspondientes (nueva estructura electron-vite)
  await Promise.all([
    replaceTokensInFile(
      path.join(targetDir, "src", "main", "index.js"),
      tokenMap,
    ),
    replaceTokensInFile(
      path.join(targetDir, "src", "renderer", "index.html"),
      tokenMap,
    ),
    replaceTokensInFile(path.join(targetDir, "README.md"), tokenMap),
    replaceTokensInFile(
      path.join(
        targetDir,
        "src",
        "renderer",
        "src",
        "routes",
        "Home",
        "Home.jsx",
      ),
      tokenMap,
    ),
  ]);

  await ensureBuildAssets(targetDir);

  console.log("");
  console.log(`Proyecto creado en: ${targetDir}`);
  console.log("");
  console.log("Siguientes pasos:");
  console.log(`  cd ${npmName}`);
  console.log("  npm run dev");

  if (!noInstall) {
    console.log("");
    console.log("Instalando dependencias...");
    await npmInstall(targetDir);
  }
}

main().catch((err) => {
  console.error("[create-athenea-app] Error:", err?.message || err);
  process.exit(1);
});
