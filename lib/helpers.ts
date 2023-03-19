export function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}

export function tags_to_valid_set(tags: string[] | null): Set<string> {
  if (!tags) return new Set<string>();

  const set = new Set<string | null | undefined>(tags);
  // delete "empty values" from `set`
  set.delete("");
  set.delete(null);
  set.delete(undefined);

  return set as Set<string>;
}
