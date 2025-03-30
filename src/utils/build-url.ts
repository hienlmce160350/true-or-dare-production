export type BaseURLOptions = {
  baseURL: string;
  cursor?: string | number;
  limit?: number;
  filters?: Record<string, unknown>;
  sort?: Record<string, unknown> | string;
  // Thêm các options phổ biến khác nếu cần
};

/**
 * Builds a URL with query parameters
 * @param options URLOptions object containing URL parameters
 * @returns Formatted URL string with query parameters
 *
 * @example
 * // Basic usage
 * buildURL({ baseURL: 'https://api.example.com/users' })
 *
 * // With query params
 * buildURL({
 *   baseURL: 'https://api.example.com/users',
 *   filters: { status: 'active' },
 *   limit: 10
 * })
 *
 * // With cursor pagination
 * buildURL({
 *   baseURL: 'https://api.example.com/users',
 *   cursor: 'next_page_token',
 *   limit: 20,
 *   filters: { role: 'admin' },
 *   sort: { createdAt: 'desc' }
 * })
 */
export const buildURL = <T extends Record<string, unknown>>(
  options: BaseURLOptions & T
): string => {
  const { baseURL, cursor, limit, filters, sort, ...customParams } = options;
  const url = new URL(baseURL);
  const searchParams = new URLSearchParams();

  // Handle limit
  if (limit) {
    searchParams.append("limit", String(limit));
  }

  // Handle cursor pagination
  if (cursor) {
    searchParams.append("cursor", String(cursor));
  }

  // Handle filters: Remove null/undefined entries
  if (filters && Object.keys(filters).length > 0) {
    const sanitizedFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([value]) => value !== undefined && value !== null
      )
    );
    searchParams.append("filters", JSON.stringify(sanitizedFilters));
  }

  // Handle sorting
  if (sort) {
    searchParams.append("sort", JSON.stringify(sort));
  }

  // Handle all custom parameters dynamically
  Object.entries(customParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  url.search = searchParams.toString();

  const result = `${url.pathname}${url.search}`;
  return result;
};
