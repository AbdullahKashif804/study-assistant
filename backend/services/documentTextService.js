const SUPPORTED_DOCUMENT_FORMATS = [
  "pdf",
  "docx",
  "pptx",
];

function normalizeFormat(format, originalName = "") {
  const cleanFormat = String(format || "")
    .toLowerCase()
    .replace(".", "")
    .trim();

  if (cleanFormat) {
    return cleanFormat;
  }

  const parts = String(originalName || "").split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

async function downloadFileBuffer(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Failed to download the attached study file"
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

async function extractDocumentText({
  url,
  format,
  originalName,
}) {
  const normalizedFormat = normalizeFormat(
    format,
    originalName
  );

  if (
    !SUPPORTED_DOCUMENT_FORMATS.includes(
      normalizedFormat
    )
  ) {
    return {
      supported: false,
      text: "",
      format: normalizedFormat,
    };
  }

  const fileBuffer = await downloadFileBuffer(url);

  const officeParser = require("officeparser");

  const ast = await officeParser.parseOffice(
    fileBuffer,
    {
      fileType: normalizedFormat,
    }
  );

  const textResult = await ast.to("text");

  const text = String(
    textResult?.value || ""
  ).trim();

  return {
    supported: true,
    text,
    format: normalizedFormat,
  };
}

module.exports = {
  extractDocumentText,
  SUPPORTED_DOCUMENT_FORMATS,
};