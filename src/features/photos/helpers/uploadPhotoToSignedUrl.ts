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

    const errorName = err instanceof Error ? err.name : 'UnknownError';
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `Photo upload timed out after ${Math.round(
          timeoutMs / 1000
        )} seconds. File: ${file.name} (${(file.size / (1024 * 1024)).toFixed(
          1
        )} MB).`
      );
    }

    throw new Error(
      `Photo upload request failed. Origin: ${window.location.origin}. File: ${
        file.name
      }. Type: ${file.type || mimeType}. Error: ${errorName} - ${errorMessage}`
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

    throw new Error(
      `Failed to upload photo to storage (${res.status} ${res.statusText})${
        responseText ? `: ${responseText}` : ''
      }`
    );
  }
}
