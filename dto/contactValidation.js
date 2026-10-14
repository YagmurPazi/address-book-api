const DtoValidationError = require("./DtoValidationError");

const NAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 254;
const TAG_MAX_LENGTH = 30;
const MAX_TAGS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Digits with an optional leading + and common separators: "+1 (555) 123-4567"
const PHONE_PATTERN = /^\+?[0-9\s\-().]+$/;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15; // E.164 limit
const PHONE_MAX_LENGTH = 30;

const FIELDS = ["firstName", "lastName", "email", "phone", "tags", "isFavorite"];

// Optional fields fall back to these when a full (POST/PUT) body leaves them out
const defaultValue = {
  email: () => null,
  phone: () => null,
  tags: () => [],
  isFavorite: () => false,
};

const parseName = (field) => (value, errors) => {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`Field '${field}' must be a non-empty string`);
    return undefined;
  }
  const name = value.trim();
  if (name.length > NAME_MAX_LENGTH) {
    errors.push(`Field '${field}' must be at most ${NAME_MAX_LENGTH} characters`);
  }
  return name;
};

// Empty string clears the field, same as null (what an emptied form input sends)
const parseEmail = (value, errors) => {
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    errors.push("Field 'email' must be a string or null");
    return undefined;
  }
  const email = value.trim().toLowerCase();
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.push("Field 'email' must be a valid email address");
  }
  return email;
};

const parsePhone = (value, errors) => {
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    errors.push("Field 'phone' must be a string or null");
    return undefined;
  }
  const phone = value.trim();
  const digitCount = phone.replace(/\D/g, "").length;
  if (
    phone.length > PHONE_MAX_LENGTH ||
    !PHONE_PATTERN.test(phone) ||
    digitCount < PHONE_MIN_DIGITS ||
    digitCount > PHONE_MAX_DIGITS
  ) {
    errors.push(
      `Field 'phone' must have ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits and only use digits, spaces, '+', '-', '.', '(' or ')'`
    );
  }
  return phone;
};

// Tags are trimmed and de-duplicated case-insensitively; the first spelling wins
const parseTags = (value, errors) => {
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string" || tag.trim() === "")) {
    errors.push("Field 'tags' must be an array of non-empty strings");
    return undefined;
  }
  const tags = [];
  for (const tag of value.map((t) => t.trim())) {
    if (!tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) tags.push(tag);
  }
  if (tags.length > MAX_TAGS) errors.push(`Field 'tags' can contain at most ${MAX_TAGS} tags`);
  if (tags.some((tag) => tag.length > TAG_MAX_LENGTH)) {
    errors.push(`Each tag must be at most ${TAG_MAX_LENGTH} characters`);
  }
  return tags;
};

const parseIsFavorite = (value, errors) => {
  if (typeof value !== "boolean") {
    errors.push("Field 'isFavorite' must be a boolean");
    return undefined;
  }
  return value;
};

const parsers = {
  firstName: parseName("firstName"),
  lastName: parseName("lastName"),
  email: parseEmail,
  phone: parsePhone,
  tags: parseTags,
  isFavorite: parseIsFavorite,
};

/**
 * Validates and normalizes a contact request body. Unknown fields (id, createdAt, ...) are ignored.
 * - full (POST, PUT): firstName and lastName are required, missing optional fields get defaults
 * - partial (PATCH): only the fields present in the body are validated and returned
 * Collects every problem and throws a single DtoValidationError listing them in `details`.
 */
const parseContactBody = (body, { partial = false } = {}) => {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new DtoValidationError("Request body must be a JSON object");
  }

  const errors = [];
  const values = {};

  for (const field of FIELDS) {
    if (body[field] === undefined) {
      if (partial) continue;
      if (defaultValue[field]) {
        values[field] = defaultValue[field]();
      } else {
        errors.push(`Field '${field}' is required`);
      }
      continue;
    }
    values[field] = parsers[field](body[field], errors);
  }

  if (partial && errors.length === 0 && Object.keys(values).length === 0) {
    errors.push(`Provide at least one of: ${FIELDS.join(", ")}`);
  }

  if (errors.length > 0) {
    throw new DtoValidationError("Validation failed", errors);
  }

  return values;
};

module.exports = { parseContactBody };
