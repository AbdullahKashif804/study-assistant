const { parentPort, workerData } = require("node:worker_threads");
const limits = require("../config/aiLimits");

(async () => {
  try {
    const parser = require("officeparser");
    const ast = await parser.parseOffice(Buffer.from(workerData.buffer), { fileType: workerData.format });
    const result = await ast.to("text");
    const text = String(result?.value || "");
    if (text.length > limits.MAX_TEXT_CHARS) parentPort.postMessage({ oversized: true });
    else parentPort.postMessage({ text: text.trim() });
  } catch { parentPort.postMessage({ failed: true }); }
})();
