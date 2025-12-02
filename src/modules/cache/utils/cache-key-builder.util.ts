import { CacheKeyOptions } from '../types/cache-options.interface';

/**
 * Utility class for building consistent cache keys
 */
export class CacheKeyBuilder {
  private static readonly DEFAULT_PREFIX = 'cache';
  private static readonly DEFAULT_SEPARATOR = ':';

  /**
   * Build a cache key from parts
   * @param parts Key parts to join
   * @param options Optional key building options
   * @returns Formatted cache key
   */
  static build(parts: (string | number)[], options?: CacheKeyOptions): string {
    const prefix = options?.prefix ?? this.DEFAULT_PREFIX;
    const separator = options?.separator ?? this.DEFAULT_SEPARATOR;

    const allParts = [prefix, ...parts.map(String)];
    return allParts.join(separator);
  }

  /**
   * Build a cache key for an entity
   * @param entityName Entity name (e.g., 'user', 'question')
   * @param id Entity ID
   * @param options Optional key building options
   * @returns Formatted cache key
   */
  static forEntity(
    entityName: string,
    id: string | number,
    options?: CacheKeyOptions,
  ): string {
    return this.build([entityName, id], options);
  }

  /**
   * Build a cache key for a list/collection
   * @param entityName Entity name
   * @param filters Optional filter parameters
   * @param options Optional key building options
   * @returns Formatted cache key
   */
  static forList(
    entityName: string,
    filters?: Record<string, any>,
    options?: CacheKeyOptions,
  ): string {
    const parts: (string | number)[] = [entityName, 'list'];

    if (filters) {
      const sortedFilters = Object.keys(filters)
        .sort()
        .map((key) => `${key}:${filters[key]}`);
      parts.push(...sortedFilters);
    }

    return this.build(parts, options);
  }
}
