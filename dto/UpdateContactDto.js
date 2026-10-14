const { parseContactBody } = require("./contactValidation");

class UpdateContactDto {
  constructor(values) {
    Object.assign(this, values);
  }

  // PUT replaces the whole contact: same rules as create, omitted optional fields are reset
  static fromPutRequest(body) {
    return new UpdateContactDto(parseContactBody(body));
  }

  // PATCH changes only the fields that are present in the body
  static fromPatchRequest(body) {
    return new UpdateContactDto(parseContactBody(body, { partial: true }));
  }

  toServiceInput() {
    return { ...this };
  }
}

module.exports = UpdateContactDto;
