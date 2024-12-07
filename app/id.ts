import { customAlphabet } from "nanoid";

export const nanoId = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

const prefixes = {
  user: "usr",
  workspace: "ws",
} as const;

/**
 *
 * @param prefix typeof keyof prefixes
 * @param byteLength number - default `16`
 * @returns string
 */
export function newId({
  prefix,
  byteLength = 16,
}: {
  prefix: keyof typeof prefixes;
  byteLength?: number;
}) {
  return `${prefixes[prefix]}_${nanoId(byteLength)}`;
}
