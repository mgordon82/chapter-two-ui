export async function uploadPhotoToSignedUrl(params: {
  uploadUrl: string;
  file: File;
  mimeType: string;
  timeoutMs?: number;
}) {
  const { uploadUrl, file, mimeType, timeoutMs = 60000 } = params;

  const body =
    file instanceof Blob ? file : new Blob([file], { type: mimeType });

  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  let res: Response;

  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType
      },
      body,
      signal: controller.signal
    });
  } catch (err) {
    window.clearTimeout(timeout);

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'Photo upload timed out. Please check your connection and try again.'
      );
    }

    throw new Error('Photo upload failed. Please try again.');
  }

  window.clearTimeout(timeout);

  if (!res.ok) {
    let responseText = '';

    try {
      responseText = await res.text();
    } catch {
      responseText = '';
    }

    throw new Error(
      `Failed to upload photo to storage (${res.status} ${res.statusText})${
        responseText ? `: ${responseText}` : ''
      }`
    );
  }
}
