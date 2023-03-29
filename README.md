# frontmatter-edit

```bash
npm install -g bun # or use package manager

# install dependencies
bun install

./batch-cleanup.ts <file|folder>
./tags-query.ts <folder>
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

## TODO

- fluent API like `unified`
- "comp.lang" -> "comp/language", "comp/dev"
- "comp.hardware" -> "comp/hardware"
- "web-\*" -> "web/\*"
- "\*/runtime" -> "runtime/\*"?  
  not needed if we have tags search

## Reference

[vfile - unified](https://unifiedjs.com/explore/package/vfile/)  
[vfile-matter - unified](https://unifiedjs.com/explore/package/vfile-matter/)

[jonschlinkert/gray-matter: Smarter YAML front matter parser](https://github.com/jonschlinkert/gray-matter)  
[nodeca/js-yaml: JavaScript YAML parser and dumper. Very fast.](https://github.com/nodeca/js-yaml)

use `unified-engine`?
[unified-args - unified](https://unifiedjs.com/explore/package/unified-args/)
[unified-engine - unified](https://unifiedjs.com/explore/package/unified-engine/)

use foam as library?
[foam/packages/foam-vscode at master · foambubble/foam](https://github.com/foambubble/foam/tree/master/packages/foam-vscode)
