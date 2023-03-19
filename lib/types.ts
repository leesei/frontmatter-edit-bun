export type FileListItem = {
  name: string;
  path: string;
};

export type Frontmatter = {
  title: string;
  tags: string[];
  created: string;
  updated?: string;
  type?: string;
  [x: string]: unknown;
};
