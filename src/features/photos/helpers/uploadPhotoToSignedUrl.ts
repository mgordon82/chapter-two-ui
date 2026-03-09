export async function uploadPhotoToSignedUrl(params: {
  uploadUrl: string;
  file: File;
  mimeType: string;
}) {
  const res = await fetch(params.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': params.mimeType
    },
    body: params.file
  });

  if (!res.ok) {
    throw new Error('Failed to upload photo to storage');
  }
}
