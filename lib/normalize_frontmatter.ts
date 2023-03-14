import { Frontmatter } from "./types.js";

// sort keys in `frontmatter` object
// also fill defaults values that matches `blogSchema`
export const normalize_frontmatter = ({
  title,
  date,
  description = "",
  postSlug = "",
  ogImage = "",
  tags,
  ...rest
}: Frontmatter) => {
  if (tags == null) {
    tags = [];
  } else {
    // filter our empty/null tags
    tags = tags.filter(Boolean);
  }
  return {
    title,
    date,
    description,
    postSlug,
    ogImage,
    tags,
    ...rest,
  };
};
