import { loginValidate, registerValidate } from '../helpers/validation.js';
import createError from 'http-errors';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../helpers/jwt.service.js';
import userService from '../services/user.services.js';
import dotenv from 'dotenv';
import userServices from '../services/user.services.js';
dotenv.config();

export default {
  register: async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      // validation data
      const { error } = registerValidate(req.body);
      if (error) {
        throw createError.BadRequest(error.details[0].message);
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
        role: 'USER',
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

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // validation data
      const { error } = loginValidate(req.body);
      if (error) {
        throw createError(error.details[0].message);
      }

      // check exists user account
      const user = await userService.getUserWithPerissionByEmail(email);
      if (!user) {
        throw createError.NotFound('This email is not exists.');
      }

      // check correct password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw createError.Unauthorized('password is incorrect.');
      }

      // create token
      const accessToken = await createAccessToken(user.id, user.email, user.role);
      const refreshToken = await createRefreshToken(user.id, user.email, user.role);

      // save new refresh token
      await userServices.updateUserById(user.id, { refreshToken });

      // save refresh_token to cookie of client
      res.cookie('MediServe_refresh_token', refreshToken, {
        domain: process.env.DOMAIN_NAME,
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 360,
      });

      res.status(200).json({
        status: 200,
        user,
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  },

  loginForCustomer: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // validation data
      const { error } = loginValidate(req.body);
      if (error) {
        throw createError.BadRequest(error.details[0].message);
      }

      // check exists user account
      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw createError.NotFound('This email is not exists.');
      }

      // check correct password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw createError.Unauthorized('password is incorrect.');
      }

      res.status(200).json({
        status: 200,
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { MediServe_refresh_token } = req.cookies;
      const refreshToken = MediServe_refresh_token;
      if (!refreshToken) {
        next(createError.BadRequest("Can't get refreshToken in req.cookies"));
      }

      const payload = await verifyRefreshToken(refreshToken);

      // clear refresh_token in DB
      await userService.updateUserById(payload.userId, { refreshToken: '' });

      // clear refresh_token in cookie
      res.clearCookie('MediServe_refresh_token', {
        domain: process.env.DOMAIN_NAME,
        path: '/',
      });

      res.status(200).json({
        status: 200,
        message: 'Logout success',
      });
    } catch (err) {
      next(err);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { MediServe_refresh_token } = req.cookies;
      const refreshToken = MediServe_refresh_token;
      if (!refreshToken) {
        next(createError.BadRequest("Can't get refreshToken in req.cookies"));
      }

      const payload = await verifyRefreshToken(refreshToken);
      const newAccessToken = await createAccessToken(payload.userId, payload.email, payload.role);
      // const newRefreshToken = await createRefreshToken(payload.userId, payload.email, payload.role);

      // Update refresh token to DB
      await userServices.updateUserById(payload.userId, { refreshToken });

      // Update refresh token in cookie
      // res.cookie('MediServe_refresh_token', refreshToken, {
      //   domain: 'mediserveserver-production.up.railway.app',
      //   path: '/',
      //   secure: true,
      //   httpOnly: true,
      //   sameSite: 'none',
      //   maxAge: 60 * 60 * 24 * 360,
      // });

      res.status(200).json({
        status: 200,
        data: {
          newAccessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
