const DtoValidationError = require("./DtoValidationError");

const SORT_FIELDS = ["firstName", "lastName", "email", "createdAt"];
const ORDERS = ["asc", "desc"];
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const SEARCH_MAX_LENGTH = 100;

// Query values arrive as strings; an empty value counts as "not given"
const readParam = (query, name, errors) => {
  const value = query[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    errors.push(`Query parameter '${name}' must be given only once`);
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const parseIntegerParam = (name, raw, max, errors) => {
  if (raw === undefined) return undefined;
  const number = Number(raw);
  if (!/^\d+$/.test(raw) || number < 1 || number > max) {
    errors.push(
      max === Infinity
        ? `Query parameter '${name}' must be a positive integer`
        : `Query parameter '${name}' must be an integer between 1 and ${max}`
    );
    return undefined;
  }
  return number;
};

/**
 * Validates the query string of GET /contacts and fills in defaults:
 * sortBy=firstName, order=asc, page=1, pageSize=10. Unknown parameters are ignored.
 */
class ContactQueryDto {
  constructor(values) {
    Object.assign(this, values);
  }

  static fromRequest(query) {
    const errors = [];
    const param = (name) => readParam(query ?? {}, name, errors);

    const search = param("search");
    if (search !== undefined && search.length > SEARCH_MAX_LENGTH) {
      errors.push(`Query parameter 'search' must be at most ${SEARCH_MAX_LENGTH} characters`);
    }

    const tag = param("tag");

    const favoriteText = param("favorite");
    let favorite;
    if (favoriteText === "true") favorite = true;
    else if (favoriteText === "false") favorite = false;
    else if (favoriteText !== undefined) errors.push("Query parameter 'favorite' must be true or false");

    const sortBy = param("sortBy") ?? "firstName";
    if (!SORT_FIELDS.includes(sortBy)) {
      errors.push(`Query parameter 'sortBy' must be one of: ${SORT_FIELDS.join(", ")}`);
    }

    const order = (param("order") ?? "asc").toLowerCase();
    if (!ORDERS.includes(order)) {
      errors.push("Query parameter 'order' must be asc or desc");
    }

    const page = parseIntegerParam("page", param("page"), Infinity, errors) ?? 1;
    const pageSize = parseIntegerParam("pageSize", param("pageSize"), MAX_PAGE_SIZE, errors) ?? DEFAULT_PAGE_SIZE;

    if (errors.length > 0) {
      throw new DtoValidationError("Invalid query parameters", errors);
    }

    return new ContactQueryDto({ search, tag, favorite, sortBy, order, page, pageSize });
  }

  toServiceInput() {
    return { ...this };
  }
}

module.exports = ContactQueryDto;
