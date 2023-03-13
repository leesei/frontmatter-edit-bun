import { Frontmatter } from "./types.js";

// also fill defaults values that matches `blogSchema`
export const sort_frontmatter_keys = ({
  title,
  postSlug = "",
  ogImage = "",
  description = "",
  tags,
  date,
  ...rest
}: Frontmatter) => {
  return {
    title,
    ogImage,
    description,
    postSlug,
    tags,
    ...rest,
    date,
  };
};
