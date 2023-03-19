#!/usr/bin/env bun

const { ArgumentParser } = require("argparse");
import { inspect } from "node:util";
import { matter } from "vfile-matter";
import { read } from "to-vfile";
import async from "async";

import { PostFrontmatter } from "./lib/schema";
import { DefaultDict } from "./lib/DefaultDict";
import { filelist } from "./lib/filelist";
import { FileListItem, Frontmatter } from "./lib/types";
import { isEmpty } from "./lib/helpers";
import { normalize_frontmatter } from "./lib/normalize_frontmatter";

const parser = new ArgumentParser({
  description: "Batch clean up frontmatters in posts.",
});
parser.add_argument("-w", "--write", {
  default: false,
  action: "store_true",
  help: "whether to write the cleaned up frontmatter back to the file",
});
parser.add_argument("in", {
  metavar: "INPUT",
  help: "input file or folder",
});
let args = parser.parse_args();
console.log(inspect(args));
// process.exit(0);

const files = await filelist(args.in, {
  filter: (name: string) => name.endsWith(".md") || name.endsWith(".mdx"),
});
// console.log(files);

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

        let frontmatter = vfile.data.matter as PostFrontmatter;
        vfile.data.matter = normalize_frontmatter(frontmatter);

        return vfile;
      });
    // .then((vfile) => {
    //   // debug printer
    //   if (vfile.data.skip) {
    //     return vfile;
    //   }

    //   const { orig, matter } = vfile.data;
    //   console.log(`${inspect(orig)}\n=> ${inspect(matter)}`);
    //   console.log("=======================");
    //   return vfile;
    // });
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
