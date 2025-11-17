# frontmatter-edit

```bash
npm install -g bun # or use package manager

# install dependencies
bun install

# normalize frontmatter, report missing fields
./batch-cleanup.ts <file|folder>
# update `updated` in frontmatter according to file's update time
./update-updated.ts <file|folder>

# query on tags
./tags-query.ts <folder>
# remove formatting escape sequences (Bun issue #24707)
./tags-query.ts <folder> | sed -r 's/\x1b\[[0-9;]*m?//g' > 1.log

# convert default Astro Paper v2.2 schema to my schema
./astro-paper <folder>
```

Like `unified`, this repo provides sample and framework for you to write your own processing pipeline.

## Rationale

- Tried `py-obsidianmd` first  
  it doesn't support my flow of updating frontmatter  
  but the construction of Notes collection and filter can be incorporated
- Tried `unified` pipeline  
  `remark-stringify` changes the post content and it is disqualified
- `vfile` and `vfile-matter`  
  does not provide API to modify frontmatter and update file  
  write file with `yaml.stringfy()`
- `gray-matter` fits my purpose in first glance, but
  - have to disable date parsing manually  
    [Disable date parsing? · Issue #62 · jonschlinkert/gray-matter](https://github.com/jonschlinkert/gray-matter/issues/62)
  - `gray-matter.stringify()` clones frontmatter and messed up my ordering
  - dependency `js-yaml` is too old and does not provide customization

## Design

1. prepare filelist from input
2. read as `vfile`, parse frontmatter (only) to `vfile.data.matter`
3. add these custom data to `vfile.data`

```js
{
  write: boolean; // whether to write file
  skip: boolean; // whether to skip processing of file
  modified: Date; // mtime of file
  orig: object; // copy of `vfile.data.matter`
}
```

4. do the processing
   - convert frontmatter schema
   - format and normalize frontmatter
   - update `updated` field
   - ...

## TODO

- fluent API like `unified`  
  refactor into middleware for `unified.use()`  
  store context in `vfile.data`  
  return `undefined` to terminate pipeline  
  keep stat for all files for reporting
- "comp.lang" -> "comp/language", "comp/dev"
- "comp.hardware" -> "comp/hardware"
- "web-\*" -> "web/\*"
- "dev/deploy" vs "web/deploy"
- "\*/runtime" -> "runtime/\*"?  
  not needed if we have tags search

## Reference

[vfile - unified](https://unifiedjs.com/explore/package/vfile/)  
[vfile-matter - unified](https://unifiedjs.com/explore/package/vfile-matter/)

[jonschlinkert/gray-matter: Smarter YAML front matter parser](https://github.com/jonschlinkert/gray-matter)  
[nodeca/js-yaml: JavaScript YAML parser and dumper. Very fast.](https://github.com/nodeca/js-yaml)

use `unified-engine`?
[Using plugins - unified](https://unifiedjs.com/learn/guide/using-plugins/)
[unified-args - unified](https://unifiedjs.com/explore/package/unified-args/)
[unified-engine - unified](https://unifiedjs.com/explore/package/unified-engine/)

use foam as library?
[foam/packages/foam-vscode at master · foambubble/foam](https://github.com/foambubble/foam/tree/master/packages/foam-vscode)
