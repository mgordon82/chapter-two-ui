export async function uploadPhotoToSignedUrl(params: {
  uploadUrl: string;
  file: File;
  mimeType: string;
}) {
  const { uploadUrl, file, mimeType } = params;

  const body =
    file instanceof Blob ? file : new Blob([file], { type: mimeType });

  let res: Response;

  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType
      },
      body
    });
  } catch (err) {
    console.error('[uploadPhotoToSignedUrl] fetch threw', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      mimeType,
      error: err instanceof Error ? err.message : String(err)
    });

    throw new Error(
      err instanceof Error
        ? `Photo upload request failed: ${err.message}`
        : 'Photo upload request failed'
    );
  }

  if (!res.ok) {
    let responseText = '';

    try {
      responseText = await res.text();
    } catch {
      responseText = '';
    }

    console.error('[uploadPhotoToSignedUrl] upload failed', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      mimeType,
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
