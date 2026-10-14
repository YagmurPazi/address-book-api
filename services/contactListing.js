const { normalizeForSearch, compareText } = require("../utils/text");

/**
 * Keeps the contacts that pass every given filter.
 * - favorite: true / false
 * - tag: exact tag, ignoring case and Turkish letters ("university" finds "University")
 * - search: every word must appear in the name, email or tags, so "ayse yilmaz",
 *   "yilmaz ayse" and "ayse family" all find Ayşe Yılmaz
 */
const filterContacts = (contacts, { search, tag, favorite }) => {
  const words = search ? normalizeForSearch(search).split(/\s+/).filter(Boolean) : [];
  const wantedTag = tag ? normalizeForSearch(tag) : null;

  return contacts.filter((contact) => {
    if (favorite !== undefined && contact.isFavorite !== favorite) return false;

    if (wantedTag && !contact.tags.some((t) => normalizeForSearch(t) === wantedTag)) return false;

    if (words.length > 0) {
      const searchable = normalizeForSearch(
        [contact.firstName, contact.lastName, contact.email ?? "", ...contact.tags].join(" ")
      );
      if (!words.every((word) => searchable.includes(word))) return false;
    }

    return true;
  });
};

const byName = (a, b) => compareText(a.firstName, b.firstName) || compareText(a.lastName, b.lastName);

// Main key first, then tie-breakers, so equal values always come out in the same order
const comparators = {
  firstName: byName,
  lastName: (a, b) => compareText(a.lastName, b.lastName) || compareText(a.firstName, b.firstName),
  email: (a, b) => compareText(a.email ?? "", b.email ?? "") || byName(a, b),
  // ISO timestamps sort correctly as plain strings
  createdAt: (a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0),
};

const sortContacts = (contacts, sortBy, order) => {
  const direction = order === "desc" ? -1 : 1;

  return [...contacts].sort((a, b) => {
    // Contacts without an email go last in both directions
    if (sortBy === "email" && !a.email !== !b.email) return a.email ? -1 : 1;
    return direction * (comparators[sortBy](a, b) || a.id - b.id);
  });
};

// page is 1-based; a page past the end is simply empty
const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
};

module.exports = { filterContacts, sortContacts, paginate };
