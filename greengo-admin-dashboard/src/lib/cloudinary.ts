import { API_BASE_URL } from './api/config';

type ImageUploadResponse = {
  url?: string;
  message?: string;
};

export function isCloudinaryConfigured() {
  return true;
}

export async function uploadImageToCloudinary(file: File, folder?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(`${API_BASE_URL}/uploads/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as ImageUploadResponse;

  if (!response.ok) {
    throw new Error(data.message || `Image upload failed (${response.status})`);
  }

  const uploadedUrl = data.url;
  if (!uploadedUrl) {
    throw new Error("backend-მა სურათის URL არ დააბრუნა");
  }

  return uploadedUrl;
}
