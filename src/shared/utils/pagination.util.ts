import { PaginationMeta } from '../interfaces/pagination.interface';

export function createPaginationMeta(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
  itemCount: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    totalItems,
    itemCount,
    itemsPerPage,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

export function getPaginationParams(page = 1, limit = 10, maxLimit = 100) {
  const safeLimit = Math.min(Math.max(limit, 1), maxLimit);
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safeLimit;

  return { safePage, safeLimit, skip };
}
