class ContactDto {
  static fromDomain(contact) {
    if (!contact) return null;
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      tags: [...contact.tags],
      isFavorite: contact.isFavorite,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  static fromDomainList(contacts) {
    return contacts.map(ContactDto.fromDomain);
  }
}

module.exports = ContactDto;
