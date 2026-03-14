import heic2any from 'heic2any';

export async function normalizeImageFile(file: File): Promise<File> {
  const type = file.type?.toLowerCase();

  if (type === 'image/heic' || type === 'image/heif') {
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    });

    const blob = Array.isArray(converted) ? converted[0] : converted;

    return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
      type: 'image/jpeg'
    });
  }

  return file;
}
