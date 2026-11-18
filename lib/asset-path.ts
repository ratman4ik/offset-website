export const BASE_PATH = "/offset-website";

export function assetPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}
