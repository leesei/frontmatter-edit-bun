import { tags_to_valid_set } from "./helpers.js";
import { PostFrontmatter } from "./schema.js";
import { Frontmatter } from "./types.js";

// sort keys in `frontmatter` object
// make `tags` unique and sorted
export const normalize_frontmatter = ({
  title,
  description = "",
  type, // optional in post
  ogImage, // optional in post
  created,
  updated, // optional in post
  tags,
  ...rest
}: Frontmatter) => {
  return {
    title,
    description,
    ...(type ? { type } : {}),
    ...(ogImage ? { ogImage } : {}),
    created,
    ...(updated ? { updated } : {}),
    tags: [...tags_to_valid_set(tags)].sort(),
    ...rest,
  } as PostFrontmatter;
};
