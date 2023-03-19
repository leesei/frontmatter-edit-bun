import { z } from "zod";

export const postSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    author: z.string().optional(),
    created: z.string(),
    updated: z.string().optional(),
    type: z.enum(["note", "snippet"]).optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    ogImage: z.string().optional(),
    tags: z.array(z.string()),
  })
  .strict();

export type PostFrontmatter = z.infer<typeof postSchema>;
