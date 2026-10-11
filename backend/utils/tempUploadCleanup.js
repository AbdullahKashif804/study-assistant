const fs = require("node:fs/promises");
const path = require("node:path");

const uploadDir = path.resolve(__dirname, "../uploads");
const requests = new WeakMap();
const tracked = new Map();

// Called only by our Multer filename callbacks, before disk storage writes.
function trackTempUpload(req, filename) {
  const state = requests.get(req);
  if (!state || path.basename(filename) !== filename) throw new Error("Invalid temporary upload registration");
  const filePath = path.resolve(uploadDir, filename);
  if (path.dirname(filePath) !== uploadDir) throw new Error("Invalid temporary upload location");
  if (tracked.has(filePath)) throw new Error("Temporary upload is already registered");
  state.paths.add(filePath);
  tracked.set(filePath, state);
}

async function removeTempUpload(filePath) {
  if (typeof filePath !== "string") return;
  const resolved = path.resolve(filePath);
  const state = tracked.get(resolved);
  if (!state) return; // Never unlink a path merely supplied via req.file or a caller.
  try {
    const info = await fs.lstat(resolved);
    if (!info.isFile() || info.isSymbolicLink()) throw new Error("Unsafe temporary upload target");
    const realDir = await fs.realpath(uploadDir);
    if (path.relative(uploadDir, realDir) !== "" || path.dirname(resolved) !== uploadDir) throw new Error("Unsafe upload directory");
    await fs.unlink(resolved);
    state.paths.delete(resolved);
    tracked.delete(resolved);
  } catch (error) {
    if (error.code === "ENOENT") {
      state.paths.delete(resolved);
      tracked.delete(resolved);
    } else {
      console.error("Temporary upload cleanup failed; manual cleanup required.");
    }
  }
}

function withTempUploadCleanup(upload) {
  return (req, res, next) => {
    const state = { paths: new Set(), parsed: false, ended: false, finishing: null };
    requests.set(req, state);
    function finish() {
      state.ended = true;
      // Wait for Multer's callback so late/partial writes are not missed.
      if (!state.parsed) return Promise.resolve();
      if (!state.finishing) {
        res.removeListener("finish", finish);
        res.removeListener("close", finish);
        state.finishing = (async () => {
          await Promise.all([...state.paths].map(removeTempUpload));
          // Failed removals require manual recovery, not indefinite in-memory retention.
          for (const filePath of state.paths) tracked.delete(filePath);
          state.paths.clear();
          requests.delete(req);
        })();
      }
      return state.finishing;
    }
    res.once("finish", finish);
    res.once("close", finish);
    function parsed(error) {
      if (state.parsed) return;
      state.parsed = true;
      if (error || state.ended) {
        void finish().then(() => { if (error) next(error); });
      } else {
        next();
      }
    }
    try { upload(req, res, parsed); } catch (error) { parsed(error); }
  };
}

module.exports = { trackTempUpload, removeTempUpload, withTempUploadCleanup };
