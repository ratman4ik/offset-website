export const BASE_PATH = process.env.NEXT_PUBLIC_OFFSET_BASE_PATH ?? "";

export function assetPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}
