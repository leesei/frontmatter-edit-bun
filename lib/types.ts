export type FileListItem = {
  name: string;
  path: string;
};

export type Frontmatter = {
  title: string;
  categories?: string[];
  tags?: string[];
  date: string;
  [x: string]: unknown;
};
