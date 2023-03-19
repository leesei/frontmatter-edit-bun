export type Frontmatter_astro_paper = {
  title: string;
  pubDatetime: string;
  postSlug: string;
  tags: string[];
  [x: string]: unknown;
};

export function post_cleanup(matter: Frontmatter_astro_paper) {
  // picked fields may be removed
  let { title, pubDatetime, tags, postSlug, ...rest } = matter;

  // remove time from `date` field
  const created = pubDatetime.split("T")[0];

  return {
    title,
    created,
    tags,
    ...rest,
  };
}
