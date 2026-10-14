const { parseContactBody } = require("./contactValidation");

class CreateContactDto {
  constructor(values) {
    Object.assign(this, values);
  }

  static fromRequest(body) {
    return new CreateContactDto(parseContactBody(body));
  }

  toServiceInput() {
    return { ...this };
  }
}

module.exports = CreateContactDto;
