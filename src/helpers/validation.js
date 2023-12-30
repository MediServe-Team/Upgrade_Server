import Joi from 'joi';

const registerValidate = (data) => {
  const accountSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    name: Joi.string().required(),
    // fullName: Joi.string().required(),
    password: Joi.string().min(8).max(32).required(),
    confirmPassword: Joi.ref('password'),
  });
  return accountSchema.validate(data);
};

const loginValidate = (data) => {
  const accountSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).max(32).required(),
  });
  return accountSchema.validate(data);
};

const passwordValidate = (data) => {
  const passwordSchema = Joi.object({
    password: Joi.string().min(8).max(32).required(),
  });
  return passwordSchema.validate(data);
};

export { registerValidate, loginValidate, passwordValidate };
