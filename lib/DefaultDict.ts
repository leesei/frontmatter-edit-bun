// https://stackoverflow.com/a/51321724
export class DefaultDict<K, V> extends Map<K, V> {
  private default: () => V;

  constructor(defaultFunction: () => V, entries?: any) {
    super(entries);
    this.default = defaultFunction;
  }

  get(key: K) {
    if (!this.has(key)) {
      this.set(key, this.default());
    }
    return super.get(key);
  }
}
