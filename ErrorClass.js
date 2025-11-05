class ErrorClass extends Error {
  constructor(message, customMessage) {
    super();
    this.message = message;
    this.customMessage = customMessage;
  }
}

module.exports = ErrorClass;
