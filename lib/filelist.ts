import { constants } from "node:fs";
import { readdir, lstat, access } from "node:fs/promises";
import { FileListItem } from "./types.js";
import { resolve, basename } from "node:path";

export async function filelist(
  path: string,
  options?: {
    filter?: (name: string) => boolean;
  }
): Promise<FileListItem[]> {
  // path MUST exists
  await access(path, constants.F_OK);

  const st = await lstat(path);
  if (st.isFile()) {
    if (options?.filter ? options.filter(basename(path)) : true)
      return [
        {
          name: basename(path),
          path: resolve(path),
        } as FileListItem,
      ];
    else return [];
  } else if (st.isDirectory()) {
    // construct file list
    const files = (await readdir(path, { withFileTypes: true }))
      .filter(
        (entry) =>
          entry.isFile() &&
          (options?.filter ? options.filter(entry.name) : true)
      )
      .map((entry) => {
        return {
          name: entry.name,
          path: resolve(path, entry.name),
        } as FileListItem;
      });

    return files;
  } else {
    throw new Error(`[${path}] unknown file type: ${st}`);
  }
}
