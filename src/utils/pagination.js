export const buildPagination = (page, limit, total) => ({
  page: Number(page),
  limit: Number(limit),
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrevious: page > 1,
});
