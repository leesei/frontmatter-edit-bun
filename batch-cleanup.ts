#!/usr/bin/env bun

import { argv } from "node:process";
import { inspect } from "node:util";
import { matter } from "vfile-matter";
import { read } from "to-vfile";
import { resolve } from "node:path";
import { VFile } from "vfile";
import { writeFile } from "node:fs/promises";
import async from "async";
import yaml from "yaml";

import { filelist } from "./lib/filelist.js";
import { FileListItem, Frontmatter } from "./lib/types.js";
import { isEmpty } from "./lib/helpers.js";
import { post_cleanup_2023 } from "./lib/post_cleanup_2023_03";
import { sort_frontmatter_keys } from "./lib/sort_frontmatter_keys";

if (argv.length < 3) {
  console.error(`Usage: bun batch-cleanup <file|folder>`);
  process.exit(1);
}
const posts_dir = argv.at(-1) as string;
console.info(`posts_dir: [${posts_dir}]`);

const files = await filelist(posts_dir, {
  filter: (name: string) => name.endsWith(".md") || name.endsWith(".mdx"),
});
console.log(files);

async.mapLimit(
  files,
  10,
  async (item: FileListItem) => {
    // console.log(item);
    return read(item.path)
      .then((vfile) => {
        // file reader
        matter(vfile, { strip: true });
        if (isEmpty(vfile.data.matter as Object)) {
          vfile.data.skip = true;
        }

        // make a copy of the original frontmatter
        vfile.data.orig = Object.assign({}, vfile.data.matter);
        return vfile;
      })
      .then((vfile) => {
        // transformer
        if (vfile.data.skip) {
          return vfile;
        }

        let frontmatter = vfile.data.matter as Frontmatter;
        frontmatter = post_cleanup_2023(frontmatter);
        frontmatter = sort_frontmatter_keys(frontmatter);
        vfile.data.matter = frontmatter;

        return vfile;
      })
      .then((vfile) => {
        // debug printer
        if (vfile.data.skip) {
          return vfile;
        }

        const { orig, matter } = vfile.data;
        console.log(`${inspect(orig)} => ${inspect(matter)}`);
        console.log("=======================");
        return vfile;
      })
      .then(async (vfile) => {
        // writer
        if (vfile.data.skip) {
          return vfile;
        }

        // write vfile to disk
        // await mkdir(vfile.dirname, { recursive: true });
        await writeFile(
          resolve(vfile.dirname!, vfile.basename!),
          "---\n" +
            yaml.stringify(vfile.data.matter) +
            "---\n" +
            vfile.toString()
        );
        return vfile;
      });
  },
  (err, vfiles) => {
    if (err) throw err;
    // filter out nulls
    vfiles = (vfiles as VFile[]).filter((vfile) => !vfile.data.skip);
    console.log(`files: ${files.length}, processed: ${vfiles.length}`);
    // console.log(contents.map((vfile) => vfile!.data.name).sort());
  }
);
