const db = require("./db");
const Contact = require("../domain/Contact");
const seedContacts = require("./seedContacts");

const listContacts = async () => db.contacts.all().map(Contact.fromRow);

const getContactById = async (id) => Contact.fromRow(db.contacts.get(id));

// Emails are stored lower-cased, so an exact match is a case-insensitive match
const findContactByEmail = async (email) =>
  Contact.fromRow(db.contacts.all().find((row) => row.email === email));

const insertContact = async (contact) => Contact.fromRow(db.contacts.insert(contact.toDbValues()));

const updateContact = async (id, contact) =>
  Contact.fromRow(db.contacts.update(id, contact.toDbValues()));

const deleteContact = async (id) => db.contacts.delete(id);

// Seed data so the API has something to show right after a (re)start
seedContacts.forEach((values) => db.contacts.insert(values));

module.exports = {
  listContacts,
  getContactById,
  findContactByEmail,
  insertContact,
  updateContact,
  deleteContact,
};
