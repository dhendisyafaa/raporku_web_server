//** Function to handle Sequelize Unique Constraint Error */
export const handleUniqueConstraintError = (error, res) => {
  const uniqueError = {
    field: error.errors[0].path,
    error: error.errors[0].message,
  };
  return res.status(400).json({ errors: [uniqueError] });
};

//** Function to handle Sequelize Unique Constraint Error */
export const handleValidationErrors = (error, res) => {
  const validationErrors = error.errors.map((err) => ({
    field: err.path,
    error: err.message,
  }));
  return res.status(400).json({ errors: validationErrors });
};

//** Function to handle internal server error */
export const handleInternalServerError = (error, res) => {
  console.log(error);
  return res.status(500).json({ error: "Internal Server Error", error: error.message });
};
