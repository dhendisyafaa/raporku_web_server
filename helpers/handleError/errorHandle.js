import {
  handleUniqueConstraintError,
  handleValidationErrors,
  handleInternalServerError,
} from "./sequelize_error.js";

// Error handling object
const errorHandlers = {
  SequelizeUniqueConstraintError: handleUniqueConstraintError,
  SequelizeValidationError: handleValidationErrors,
  InternalServerError: handleInternalServerError,
};

export default errorHandlers;
