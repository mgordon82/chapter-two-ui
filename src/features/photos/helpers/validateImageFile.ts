const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const ALLOWED_INPUT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif'
];

export function validateImageFile(file: File): string | null {
  if (!file) {
    return 'No file selected.';
  }

  if (!ALLOWED_INPUT_MIME_TYPES.includes(file.type)) {
    return 'Please choose a JPEG, PNG, HEIC, or HEIF image.';
  }

  if (file.size <= 0) {
    return 'The selected image appears to be empty.';
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return 'Please choose an image smaller than 10 MB.';
  }

  return null;
}
