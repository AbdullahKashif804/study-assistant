const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const { runDiagnostic, createPDF } = require("../scripts/cloudinaryPrivacyDiagnostic");

function fixture(mode = "success") {
  const logs = [], deletions = [], requests = [];
  let file, publicId, pdf;
  const cloudinary = {
    uploader: {
      async upload(input, options) {
        file = input; publicId = options.public_id; pdf = await fs.readFile(input);
        assert.equal(options.resource_type, "raw");
        assert.equal(options.type, "authenticated");
        assert.equal(options.overwrite, false);
        assert.match(publicId, /^study_assistant_privacy_diagnostics\/[a-f0-9-]+\.pdf$/);
        if (mode === "uploadFailure" || mode === "collision") {
          throw { http_code: mode === "collision" ? 409 : 500, message: "sensitive-provider-detail" };
        }
        return { public_id: publicId, resource_type: "raw", type: "authenticated", version: 1 };
      },
      async destroy(id, options) {
        assert.equal(id, publicId);
        assert.deepEqual(options, { resource_type: "raw", type: "authenticated", invalidate: true, timeout: 30000 });
        deletions.push(id);
        if (mode === "cleanupFailure") throw new Error("sensitive-provider-detail");
        return { result: "ok" };
      },
    },
    url(id, options) {
      assert.equal(id, publicId);
      assert.equal(options.sign_url, false);
      return `https://res.cloudinary.com/fixture/raw/${options.type}/diagnostic.pdf`;
    },
    utils: {
      private_download_url(id, format, options) {
        assert.equal(id, publicId); assert.equal(format, "pdf");
        assert.equal(options.type, "authenticated"); assert.equal(options.resource_type, "raw");
        assert.ok(options.expires_at - Math.floor(Date.now() / 1000) <= 60);
        assert.ok(options.expires_at > Date.now() / 1000);
        return "https://api.cloudinary.com/v1_1/fixture/raw/download?signature=do-not-log";
      },
    },
  };
  async function fetchImpl(url, options) {
    requests.push(url);
    assert.equal(options.redirect, "manual");
    assert.ok(options.signal);
    if (mode === "networkFailure") throw new Error("sensitive-provider-detail");
    if (url.startsWith("https://res.cloudinary.com")) {
      return new Response(mode === "publicExposure" ? pdf : null, { status: mode === "publicExposure" ? 200 : 404 });
    }
    return new Response(mode === "wrongBytes" ? "different" : pdf);
  }
  return {
    logs, deletions, requests,
    async run() {
      const code = await runDiagnostic(cloudinary, { fetchImpl, log: message => logs.push(message) });
      await assert.rejects(fs.access(file), { code: "ENOENT" });
      assert.ok(!logs.join("\n").includes("sensitive-provider-detail"));
      assert.ok(!logs.join("\n").includes("signature="));
      assert.ok(!logs.join("\n").includes("https://"));
      return code;
    },
  };
}

test("diagnostic PDF is non-sensitive and validly framed; authenticated retrieval and cleanup succeed", async () => {
  const pdf = createPDF().toString();
  assert.ok(pdf.startsWith("%PDF-1.4")); assert.ok(pdf.endsWith("%%EOF\n"));
  const f = fixture(); assert.equal(await f.run(), 0);
  assert.equal(f.requests.length, 3); assert.equal(f.deletions.length, 1);
});
for (const mode of ["uploadFailure", "networkFailure", "publicExposure", "wrongBytes", "cleanupFailure"]) {
  test(`${mode} fails safely and attempts only diagnostic cleanup`, async () => {
    const f = fixture(mode); assert.equal(await f.run(), 1);
    assert.equal(f.deletions.length, mode === "cleanupFailure" ? 3 : 1);
  });
}
test("existing asset collision fails without any cloud deletion", async () => {
  const f = fixture("collision"); assert.equal(await f.run(), 1);
  assert.equal(f.deletions.length, 0); assert.equal(f.requests.length, 0);
});
