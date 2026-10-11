// Standalone opt-in diagnostic. Never import application startup or database code.
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

function createPDF() {
  const text = "BT /F1 12 Tf 40 100 Td (Disposable Cloudinary privacy diagnostic. No user data.) Tj ET\n";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 160] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}endstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const start = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}`;
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return Buffer.from(pdf);
}

async function retrieve(url, fetchImpl, signed = false) {
  const parsed = new URL(url);
  // No redirects: never send signed-access parameters to another origin.
  if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
      parsed.hostname !== (signed ? "api.cloudinary.com" : "res.cloudinary.com")) {
    throw new Error("Unexpected delivery endpoint");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(url, {
      redirect: "manual", signal: controller.signal, cache: "no-store",
    });
    if (response.status !== 200) {
      await response.body?.cancel();
      return { status: response.status };
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 65536) {
          controller.abort();
          throw new Error("Unexpected diagnostic response size");
        }
        chunks.push(Buffer.from(value));
      }
    } finally { reader.releaseLock(); }
    return { status: response.status, bytes: Buffer.concat(chunks) };
  } finally { clearTimeout(timer); }
}

async function runDiagnostic(cloudinary, { fetchImpl = globalThis.fetch, log = console.log } = {}) {
  const publicId = `study_assistant_privacy_diagnostics/${randomUUID()}.pdf`;
  let directory;
  let uploadAttempted = false;
  let collision = false;
  let passed = false;
  let cleaned = true;
  let stage = "local PDF creation";
  // Public ID is a disposable recovery identifier, never a credential or access URL.
  log(`Diagnostic asset identifier (retain if interrupted): ${publicId}`);
  try {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "study-cloudinary-diagnostic-"));
    const file = path.join(directory, "diagnostic.pdf");
    const pdf = createPDF();
    await fs.writeFile(file, pdf, { flag: "wx" });
    stage = "authenticated raw upload";
    uploadAttempted = true;
    let result;
    try {
      result = await cloudinary.uploader.upload(file, {
        public_id: publicId, resource_type: "raw", type: "authenticated",
        overwrite: false, use_filename: false, unique_filename: false, timeout: 60000,
      });
    } catch (error) {
      // A collision must never cause deletion of a pre-existing asset.
      collision = error?.http_code === 409;
      throw new Error("Upload failed");
    }
    if (result?.existing || result?.overwritten === true) {
      collision = true;
      throw new Error("Unexpected existing asset");
    }
    if (result?.public_id !== publicId || result?.resource_type !== "raw" ||
        result?.type !== "authenticated") throw new Error("Unexpected upload metadata");
    log("PASS: new asset reports raw/authenticated delivery.");

    stage = "unsigned access denial";
    const unsigned = cloudinary.url(publicId, {
      resource_type: "raw", type: "authenticated", secure: true,
      sign_url: false, version: result.version,
    });
    const denied = await retrieve(unsigned, fetchImpl);
    if (![401, 403, 404].includes(denied.status)) throw new Error("Unsigned access not denied");
    // Also verify that changing the path to public delivery doesn't expose a copy.
    const publicURL = cloudinary.url(publicId, {
      resource_type: "raw", type: "upload", secure: true, sign_url: false,
    });
    const publicDenied = await retrieve(publicURL, fetchImpl);
    if (![401, 403, 404].includes(publicDenied.status)) throw new Error("Public access not denied");
    log("PASS: unsigned authenticated and public delivery requests are denied.");

    stage = "short-lived authenticated retrieval";
    const expiresAt = Math.floor(Date.now() / 1000) + 60;
    const signedURL = cloudinary.utils.private_download_url(publicId, "pdf", {
      resource_type: "raw", type: "authenticated", secure: true,
      expires_at: expiresAt, attachment: true,
    });
    const received = await retrieve(signedURL, fetchImpl, true);
    if (received.status !== 200 || !received.bytes?.equals(pdf)) {
      throw new Error("Authenticated retrieval did not match uploaded PDF");
    }
    log("PASS: backend retrieved the exact PDF using a 60-second signed download.");
    passed = true;
  } catch {
    // Never print SDK errors, request URLs, credentials, headers, or response bodies.
    log(`FAIL: ${stage}. Details suppressed; check account compatibility/settings.`);
  } finally {
    if (uploadAttempted && !collision) {
      cleaned = false;
      // Also attempt cleanup after an ambiguous upload failure, using ONLY our UUID.
      for (let attempt = 0; attempt < 3 && !cleaned; attempt++) {
        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw", type: "authenticated", invalidate: true, timeout: 30000,
          });
          cleaned = ["ok", "not found"].includes(result?.result);
        } catch { /* safe bounded retry; never print provider details */ }
      }
      log(cleaned ? "PASS: diagnostic cloud asset cleanup confirmed." :
        `CLEANUP REQUIRED: only raw/authenticated asset ${publicId}. Do not delete any other asset.`);
    } else if (collision) {
      log("FAIL: existing-asset collision detected; cloud deletion intentionally skipped.");
      passed = false;
    }
    if (directory) {
      try {
        // Only our known file and fresh directory; no recursive deletion.
        await fs.unlink(path.join(directory, "diagnostic.pdf")).catch(error => {
          if (error.code !== "ENOENT") throw error;
        });
        await fs.rmdir(directory);
        log("PASS: disposable local PDF removed.");
      } catch {
        cleaned = false;
        log("CLEANUP REQUIRED: local diagnostic temporary directory; no unrelated files were removed.");
      }
    }
  }
  const success = passed && cleaned;
  log(success ? "OVERALL PASS: authenticated raw PDF compatibility verified and cleanup confirmed." :
    "OVERALL FAIL: compatibility or cleanup was not fully verified.");
  return success ? 0 : 1;
}

async function main() {
  if (process.argv.length !== 3 || process.argv[2] !== "--confirm-cloudinary-test") {
    console.log("No Cloudinary operations performed. To explicitly authorize this disposable live test:");
    console.log("  node scripts/cloudinaryPrivacyDiagnostic.js --confirm-cloudinary-test");
    return;
  }
  // Runtime-only loading after explicit opt-in. No environment values are printed.
  require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
  const cloudinary = require("../config/cloudinary");
  const config = cloudinary.config();
  if (![config.cloud_name, config.api_key, config.api_secret].every(value => typeof value === "string" && value.trim())) {
    console.log("FAIL: required Cloudinary runtime configuration is missing. No upload attempted.");
    process.exitCode = 1;
    return;
  }
  process.exitCode = await runDiagnostic(cloudinary);
}

if (require.main === module) {
  main().catch(() => {
    console.log("FAIL: diagnostic could not initialize. Details suppressed.");
    process.exitCode = 1;
  });
}
module.exports = { runDiagnostic, createPDF };
