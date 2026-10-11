import { API_BASE_URL } from "../config/api";

// Fetch with the existing bearer token; never put tokens or signed URLs in links.
export async function openAttachment(module, record, download = false) {
  const popup = download ? null : window.open("about:blank", "_blank");
  if (popup) popup.opener = null;
  if (!download && !popup) {
    window.alert("Allow popups to preview attachments, or use Download.");
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let objectURL;
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Sign in to access attachments.");
    const version = encodeURIComponent(record.attachment.publicId);
    const response = await fetch(`${API_BASE_URL}/api/${module}/attachment/${encodeURIComponent(record._id)}?version=${version}&download=${download ? "1" : "0"}`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, cache: "no-store",
    });
    if (!response.ok) throw new Error(response.status === 401 ? "Sign in to access attachments." :
      response.status === 404 ? "This attachment is no longer available." : "Attachment could not be retrieved. Please try again.");
    const blob = await response.blob();
    if (blob.size > 10 * 1024 * 1024) throw new Error("Attachment exceeds the delivery size limit.");
    const inline = !download && /^((application\/pdf)|(image\/(jpeg|png|gif|webp)))$/.test(blob.type);
    // Recreate the Blob so unknown MIME types cannot execute active content.
    objectURL = URL.createObjectURL(new Blob([blob], { type: inline ? blob.type : "application/octet-stream" }));
    if (inline) {
      popup.location.replace(objectURL);
      const retainedURL = objectURL;
      const started = Date.now();
      const cleanup = setInterval(() => {
        if (popup.closed || Date.now() - started > 10 * 60 * 1000) {
          URL.revokeObjectURL(retainedURL); clearInterval(cleanup);
        }
      }, 1000);
      objectURL = null;
    } else {
      popup?.close();
      const link = document.createElement("a");
      link.href = objectURL;
      link.download = record.attachment.originalName || "attachment";
      document.body.append(link); link.click(); link.remove();
      const retainedURL = objectURL;
      setTimeout(() => URL.revokeObjectURL(retainedURL), 60000);
      objectURL = null;
    }
  } catch (error) {
    popup?.close();
    window.alert(error.name === "AbortError" ? "Attachment retrieval timed out. Please try again." :
      ["Sign in to access attachments.", "This attachment is no longer available.", "Attachment exceeds the delivery size limit.", "Attachment could not be retrieved. Please try again."].includes(error.message) ? error.message : "Attachment could not be retrieved. Please try again.");
  } finally {
    clearTimeout(timer);
    if (objectURL) URL.revokeObjectURL(objectURL);
  }
}
