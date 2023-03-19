import { tags_to_valid_set } from "./helpers.js";
import { Frontmatter } from "./types.js";

export type Frontmatter_2023_03 = {
  title: string;
  categories?: string[];
  tags?: string[];
  date: string;
  [x: string]: unknown;
};

export function post_cleanup(matter: Frontmatter_2023_03) {
  // picked fields may be removed
  // remove `toc` field
  let { date, categories, tags, toc, ...rest } = matter;

  // remove time from `date` field
  const created = date.split(" ")[0];

  // trim `tags`
  tags = tags ? tags : [];

  if (categories) {
    // move `categories` into `tags`, make them leading
    // console.log(matter.categories, tags);
    tags = [...categories, ...tags];
  }

  // make `tags` unique
  const tags_set = tags_to_valid_set(tags);
  // delete "notes" from `tags`
  tags_set.delete("notes");

  return {
    ...rest,
    tags: [...tags_set],
    created,
    // add `type` field for "snippet" (for Foam)
    ...(tags_set.has("snippet") ? { type: "snippet" } : {}),
  };
}
