import { loginValidate, registerValidate } from '../helpers/validation.js';
import createError from 'http-errors';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../helpers/jwt.service.js';
import userService from '../services/user.services.js';

export default {
  register: async (req, res, next) => {
    try {
      const { email, password, name, fullName } = req.body;

      // validation data
      const { error } = registerValidate(req.body);
      if (error) {
        throw createError(error.details[0].message);
      }

      // check registered email
      const isExistEmail = await userService.getUserByEmail(email);
      if (isExistEmail) {
        throw createError.Conflict('This is email already exists');
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const userInvo = {
        email,
        password: hashPassword,
        name,
        fullName,
      };

      const saveUser = await userService.createUser(userInvo);

      res.json({
        status: 201,
        data: saveUser,
      });
    } catch (err) {
      next(err);
    }
  },
};
