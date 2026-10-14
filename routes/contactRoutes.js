const express = require("express");
const ContactService = require("../services/contactService");
const ContactDto = require("../dto/ContactDto");
const CreateContactDto = require("../dto/CreateContactDto");
const UpdateContactDto = require("../dto/UpdateContactDto");
const DtoValidationError = require("../dto/DtoValidationError");

const router = express.Router();
const contactService = new ContactService();

// Errors thrown in these async handlers (validation 400, conflict 409, ...) are passed by
// Express 5 to the error handler in index.js, so the routes need no try/catch.

// "abc" or "1.5" is a malformed request (400), not a missing contact (404)
const parseId = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new DtoValidationError("Path parameter 'id' must be a positive integer");
  }
  return id;
};

const sendNotFound = (res) => res.status(404).json({ error: "Contact not found" });

/**
 * GET /contacts
 */
router.get("/", async (req, res) => {
  const contacts = await contactService.list();
  res.json(ContactDto.fromDomainList(contacts));
});

/**
 * GET /contacts/:id
 */
router.get("/:id", async (req, res) => {
  const contact = await contactService.get(parseId(req));
  if (!contact) return sendNotFound(res);
  res.json(ContactDto.fromDomain(contact));
});

/**
 * POST /contacts
 * firstName and lastName are required; email, phone, tags and isFavorite are optional
 */
router.post("/", async (req, res) => {
  const createContactDto = CreateContactDto.fromRequest(req.body);
  const contact = await contactService.create(createContactDto.toServiceInput());
  res.status(201).location(`/contacts/${contact.id}`).json(ContactDto.fromDomain(contact));
});

/**
 * PUT /contacts/:id
 * Full replace: same body as POST, omitted optional fields are reset to their defaults
 */
router.put("/:id", async (req, res) => {
  const id = parseId(req);
  const updateContactDto = UpdateContactDto.fromPutRequest(req.body);
  const updated = await contactService.replace(id, updateContactDto.toServiceInput());
  if (!updated) return sendNotFound(res);
  res.json(ContactDto.fromDomain(updated));
});

/**
 * PATCH /contacts/:id
 * Partial update: only the fields in the body change
 */
router.patch("/:id", async (req, res) => {
  const id = parseId(req);
  const updateContactDto = UpdateContactDto.fromPatchRequest(req.body);
  const updated = await contactService.update(id, updateContactDto.toServiceInput());
  if (!updated) return sendNotFound(res);
  res.json(ContactDto.fromDomain(updated));
});

/**
 * DELETE /contacts/:id
 */
router.delete("/:id", async (req, res) => {
  const deleted = await contactService.delete(parseId(req));
  if (!deleted) return sendNotFound(res);
  res.json({ message: "Contact deleted", contact: ContactDto.fromDomain(deleted) });
});

module.exports = router;
