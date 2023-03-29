#!/usr/bin/env bun

const { ArgumentParser } = require("argparse");
import async from "async";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { inspect, isDeepStrictEqual } from "node:util";
import { read } from "to-vfile";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
import yaml from "yaml";

import { filelist } from "./lib/filelist";
import { normalize_frontmatter } from "./lib/normalize_frontmatter";
import { PostFrontmatter } from "./lib/schema.js";
import { FileListItem } from "./lib/types";

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
        vfile.data.skip = isDeepStrictEqual(vfile.data.matter, {});
        vfile.data.write = args.write;
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
        // whether we need to write the file back to disk
        // this is not good enough
        // the parsed yaml is already different from the yaml frontmatter
        // which may yield a false positive
        // https://github.com/vfile/vfile-matter/issues/5
        // vfile.data.write = vfile.data.write && !isDeepStrictEqual(
        //   vfile.data.orig,
        //   vfile.data.matter
        // );

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

        // console.log(yaml.stringify(vfile.data.matter));
        // console.log("=======================");
        return vfile;
      })
      .then(async (vfile) => {
        // writer
        if (vfile.data.skip || !vfile.data.write) {
          return vfile;
        }

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
    const vfiles_processed = (vfiles as VFile[]).filter(
      (vfile) => vfile && !vfile.data.skip
    );
    const vfiles_written = vfiles_processed.filter(
      (vfile) => vfile && vfile.data.write
    );
    if (args.write) {
      console.log(
        args.out != "-"
          ? `output folder: [${args.out}]`
          : `output folder: (same as input)`
      );
    }
    console.log(
      `files: ${files.length}, processed: ${vfiles_processed.length}, written: ${vfiles_written.length}`
    );
    // console.log(contents.map((vfile) => vfile!.data.name).sort());
  }
);
