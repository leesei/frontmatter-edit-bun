import { Frontmatter } from "./types.js";

export function post_cleanup_2023(matter: Frontmatter): Frontmatter {
  // trim `tags`
  matter.tags = matter.tags
    ? matter.tags.filter((tag: string | null) => tag)
    : [];

  if (matter.categories) {
    // move `categories` into `tags`, make them leading
    // console.log(frontmatter.categories, frontmatter.tags);
    matter.tags = matter.categories.concat(matter.tags);
    delete matter.categories;
  }

  // remove time from `date` field
  matter.date = matter.date.split(" ")[0];

  // remove `toc` field
  delete matter.toc;

  // delete "notes" from `tags`
  matter.tags = matter.tags.filter((tag: string) => tag !== "notes");

  // search "snippet" from `tags` and add `type` field (for Foam)
  if (matter.tags.find((tag: string) => tag === "snippet")) {
    matter.type = "snippet";
  }

  return matter;
}
