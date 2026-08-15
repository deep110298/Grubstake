const MAX_DIMENSION = 1568; // matches Claude vision's effective max before internal downscaling
const JPEG_QUALITY = 0.82;

export interface CompressedImage {
  dataUrl: string;
  base64: string;
  mediaType: 'image/jpeg';
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  const base64 = dataUrl.split(',')[1];

  return { dataUrl, base64, mediaType: 'image/jpeg' };
}
