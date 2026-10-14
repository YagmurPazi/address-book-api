const contactDBContext = require("../db/contactDBContext");
const Contact = require("../domain/Contact");
const ConflictError = require("./ConflictError");

class ContactService {
  async list() {
    return contactDBContext.listContacts();
  }

  async get(id) {
    return contactDBContext.getContactById(id);
  }

  async create(input) {
    await this.#ensureEmailIsFree(input.email);

    const now = new Date().toISOString();
    const contact = new Contact({ ...input, createdAt: now, updatedAt: now });
    return contactDBContext.insertContact(contact);
  }

  // Full replace: every editable field comes from the input, only id and createdAt are kept
  async replace(id, input) {
    const existing = await contactDBContext.getContactById(id);
    if (!existing) return null;

    await this.#ensureEmailIsFree(input.email, id);

    const contact = new Contact({
      ...input,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });
    return contactDBContext.updateContact(id, contact);
  }

  // Partial update: fields missing from the input keep their current value
  async update(id, changes) {
    const existing = await contactDBContext.getContactById(id);
    if (!existing) return null;

    if (changes.email !== undefined) {
      await this.#ensureEmailIsFree(changes.email, id);
    }

    const contact = new Contact({
      ...existing,
      ...changes,
      id,
      updatedAt: new Date().toISOString(),
    });
    return contactDBContext.updateContact(id, contact);
  }

  // Favorite is just a partial update of one field, so reuse update()
  async setFavorite(id, isFavorite) {
    return this.update(id, { isFavorite });
  }

  async delete(id) {
    const existing = await contactDBContext.getContactById(id);
    if (!existing) return null;

    await contactDBContext.deleteContact(id);
    return existing;
  }

  // Two contacts may not share an email; a contact may keep its own email on update
  async #ensureEmailIsFree(email, ownId = null) {
    if (!email) return;

    const owner = await contactDBContext.findContactByEmail(email);
    if (owner && owner.id !== ownId) {
      throw new ConflictError(`A contact with email '${email}' already exists (id ${owner.id})`);
    }
  }
}

module.exports = ContactService;
