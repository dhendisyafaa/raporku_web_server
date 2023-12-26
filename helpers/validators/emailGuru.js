const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validDomain = email.endsWith('@guru.smk.belajar.id');
  return email.match(emailRegex) && validDomain;
};

export default validateEmail;