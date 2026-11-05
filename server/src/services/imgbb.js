import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";

/** Uploads an image buffer to imgbb server-side (the API key never reaches the browser). */
export async function uploadImage(file) {
  if (!env.IMGBB_API_KEY) throw new ApiError(503, "UPLOAD_UNAVAILABLE", "Image uploads are not configured");

  const body = new FormData();
  body.append("image", file.buffer.toString("base64"));
  body.append("name", file.originalname?.replace(/\.[^.]+$/, "") ?? "upload");

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(env.IMGBB_API_KEY)}`, {
    method: "POST",
    body,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.url) {
    console.error("[imgbb] upload failed", res.status, json?.error?.message);
    throw new ApiError(502, "UPLOAD_FAILED", "Image upload failed, please try again");
  }
  return json.data.url;
}
