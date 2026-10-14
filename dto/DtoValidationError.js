class DtoValidationError extends Error {
  constructor(message, details = undefined) {
    super(message);
    this.name = "DtoValidationError";
    this.statusCode = 400;
    this.details = details;
  }
}

module.exports = DtoValidationError;
