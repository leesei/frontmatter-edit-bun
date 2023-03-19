#!/usr/bin/env bun

const { ArgumentParser } = require("argparse");
import { inspect } from "node:util";
import { matter } from "vfile-matter";
import { mkdir, writeFile } from "node:fs/promises";
import { read } from "to-vfile";
import { resolve } from "node:path";
import { VFile } from "vfile";
import async from "async";
import yaml from "yaml";

import { filelist } from "./lib/filelist";
import { FileListItem } from "./lib/types";
import { Frontmatter_2023_03, post_cleanup } from "./lib/post_cleanup_2023_03";
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
parser.add_argument("-o", "--out", {
  metavar: "FOLDER",
  default: "./out",
  help: "if `write` is specified, output a copy of files in `FOLDER`; set folder as `-` to overwrite the input files",
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

        vfile.data.matter = normalize_frontmatter(
          post_cleanup(vfile.data.matter as Frontmatter_2023_03)
        );

        return vfile;
      })
      .then((vfile) => {
        // debug printer
        if (vfile.data.skip) {
          return vfile;
        }

        const { orig, matter } = vfile.data;
        console.log(`${inspect(orig)}\n=> ${inspect(matter)}`);
        console.log("=======================");
        return vfile;
      })
      .then(async (vfile) => {
        // writer
        if (vfile.data.skip || !args.write) {
          return vfile;
        }
        // console.log(yaml.stringify(vfile.data.matter));
        // return vfile;

        // write vfile to disk
        let out_path = vfile.path;
        if (args.out != "-") {
          await mkdir(args.out, { recursive: true });
          out_path = resolve(args.out, vfile.basename!);
        }
        await writeFile(
          out_path,
          "---\n" +
            yaml.stringify(vfile.data.matter) +
            "---\n" +
            vfile.toString()
        );
        return vfile;
      })
      .catch((err) => {
        console.error(`file: ${item.path}`);
        console.error(err);
        process.exit(1);
      });
  },
  (err, vfiles) => {
    if (err) throw err;
    // filter out nulls
    vfiles = (vfiles as VFile[]).filter((vfile) => vfile && !vfile.data.skip);
    if (args.write) {
      console.log(
        args.out != "-"
          ? `output folder: [${args.out}]`
          : `output folder: (same as input)`
      );
    }
    console.log(`files: ${files.length}, processed: ${vfiles.length}`);
    // console.log(contents.map((vfile) => vfile!.data.name).sort());
  }
);
