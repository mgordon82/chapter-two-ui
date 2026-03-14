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
    console.log('[uploadPhotoToSignedUrl] starting upload', {
      origin: window.location.origin,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      mimeType,
      timeoutMs,
      uploadUrl
    });

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

    console.error('[uploadPhotoToSignedUrl] fetch threw', {
      origin: window.location.origin,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      mimeType,
      timeoutMs,
      uploadUrl,
      errorName: err instanceof Error ? err.name : null,
      errorMessage: err instanceof Error ? err.message : String(err)
    });

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'Photo upload timed out. Please check your connection and try again.'
      );
    }

    throw new Error(
      err instanceof Error
        ? `Photo upload request failed: ${err.message}`
        : 'Photo upload request failed'
    );
  }

  window.clearTimeout(timeout);

  if (!res.ok) {
    let responseText = '';

    try {
      responseText = await res.text();
    } catch {
      responseText = '';
    }

    console.error('[uploadPhotoToSignedUrl] upload failed', {
      origin: window.location.origin,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      mimeType,
      timeoutMs,
      uploadUrl,
      status: res.status,
      statusText: res.statusText,
      responseText
    });

    throw new Error(
      `Failed to upload photo to storage (${res.status} ${res.statusText})${
        responseText ? `: ${responseText}` : ''
      }`
    );
  }
}
