class Contact {
  constructor({
    id = null,
    firstName,
    lastName,
    email = null,
    phone = null,
    tags = [],
    isFavorite = false,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.tags = [...tags];
    this.isFavorite = Boolean(isFavorite);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Contact(row);
  }

  // Copy tags so the stored row and the domain object never share the same array
  toDbValues() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      tags: [...this.tags],
      isFavorite: this.isFavorite,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Contact;
