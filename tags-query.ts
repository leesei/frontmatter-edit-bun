#!/usr/bin/env bun

import { argv } from "node:process";
import { inspect } from "node:util";
import { matter } from "vfile-matter";
import { read } from "to-vfile";
import async from "async";

import { filelist } from "./lib/filelist.js";
import { FileListItem, Frontmatter } from "./lib/types.js";
import { isEmpty } from "./lib/helpers.js";
import { DefaultDict } from "./lib/DefaultDict.js";

if (argv.length < 3) {
  console.error("Usage: bun tags-query <folder>");
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
        // debug printer
        if (vfile.data.skip) {
          return vfile;
        }

        const { orig, matter } = vfile.data;
        console.log(`${inspect(orig)} => ${inspect(matter)}`);
        console.log("=======================");
        return vfile;
      });
  },
  (err, vfiles) => {
    if (err) throw err;

    // filter out nulls
    vfiles = vfiles!.filter((vfile) => vfile && !vfile.data.skip);
    console.log(`files: ${files.length}, processed: ${vfiles.length}`);

    let tags_to_posts = new DefaultDict<string, Set<string>>(
      () => new Set<string>()
    );
    for (const vfile of vfiles) {
      const { matter } = vfile!.data;
      const { tags } = matter as Frontmatter;
      for (const tag of tags!) {
        tags_to_posts.get(tag)!.add(vfile?.basename as string);
      }
    }
    console.log(tags_to_posts);

    const filtered = vfiles!.filter((vfile) => {
      const { matter } = vfile!.data;
      const { tags } = matter as Frontmatter;
      return tags!.includes("games") && tags!.includes("python");
    });
    console.log(filtered.map((vfile) => vfile!.basename).sort());
  }
);
