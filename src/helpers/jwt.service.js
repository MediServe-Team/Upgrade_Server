import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import connectToRedis from '../config/redis.client.js';

const createAccessToken = async (userId, email, role) => {
  return new Promise((resolve, reject) => {
    const payload = { userId, email, role };

    const options = {
      algorithm: 'HS256',
      expiresIn: '1h',
    };

    const secretKey = process.env.SECRET_ACCESS_TOKEN_KEY;

    jwt.sign(payload, secretKey, options, (error, token) => {
      if (error) {
        reject(error);
      }
      resolve(token);
    });
  });
};

const verifyAccessToken = async (req, res, next) => {
  if (!req.headers['authorization']) {
    return next(createError.Unauthorized('Not found authorization information in header of request.'));
  }

  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader.split(' ');
  const token = bearerToken[1];

  // verify access token
  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN_KEY, (error, payload) => {
    if (error) {
      if (error.name == 'JsonWebTokenError') {
        return next(createError.Unauthorized());
      }
      return next(createError.Unauthorized(error.message));
    }

    req.payload = payload;

    next();
  });
};

const createRefreshToken = async (userId, email, role) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
      email,
      role,
    };

    const options = {
      algorithm: 'HS256',
      expiresIn: '1y',
    };

    const secretKey = process.env.SECRECT_REFRESH_TOKEN_KEY;

    jwt.sign(payload, secretKey, options, (error, token) => {
      if (error) {
        reject(error);
      }
      resolve(token);
    });
  });
};

const verifyRefreshToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRECT_REFRESH_TOKEN_KEY, (error, payload) => {
      if (error) {
        reject(error);
      }

      resolve(payload);
    });
  });
};

const verifyAdminAccess = async (req, res, next) => {
  //* This middleware apply after use verify access Token.
  if (req.payload.role === 'ADMIN') next();
  else return next(createError.BadRequest('Only admin can to use this resource'));
};

const verifyStaffAdminAccess = async (req, res, next) => {
  //* This middleware apply after use verify access Token.
  if (req.payload.role === 'STAFF' || req.payload.role === 'ADMIN') next();
  else return next(createError.Unauthorized('Only staff and admin can to use this resource'));
};

const createResetPasswordToken = async (email) => {
  return new Promise((resolve, reject) => {
    //* tạo jwt token với payload = email
    const payload = { email };

    const options = {
      algorithm: 'HS256',
      expiresIn: process.env.RESET_PASSWORD_TOKEN_EXP_TIME,
    };

    const secretKey = process.env.RESET_PASSWORD_SECRECT_KEY;

    jwt.sign(payload, secretKey, options, async (error, token) => {
      if (error) {
        reject(error);
      }

      try {
        //* store token into redis {email: token}
        const redis = await connectToRedis();

        await redis.set(email, token, {
          EX: Number(process.env.RESET_PASSWORD_TOKEN_EXP_TIME_REDIS),
        });
      } catch (err) {
        reject(error);
      }

      resolve(token);
    });
  });
};

const verifyResetPasswordToken = async (req, res, next) => {
  const { token } = req.params;
  if (!token) next(createError.NotFound('reset password token not found.'));

  //* verify jwt token
  jwt.verify(token, process.env.RESET_PASSWORD_SECRECT_KEY, async (error, payload) => {
    if (error) {
      return next(createError.Unauthorized(error.message));
    }

    //* check has email in token payload
    if (!payload?.email) {
      return next(createError.Unauthorized('Reset password token is not exists.'));
    }

    //* get token in redis by email key
    const redis = await connectToRedis();
    const redisToken = await redis.get(payload.email);

    //* check email key exist in redis
    if (!redisToken) {
      return next(createError.Unauthorized('Reset password token is not exists.'));
    }

    //* compare input_token with latest_token in redis
    if (redisToken !== token) {
      return next(createError.Unauthorized('Reset password token is invalid.'));
    }

    req.payload = payload;
    next();
  });
};

export {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  verifyAdminAccess,
  verifyStaffAdminAccess,
  createResetPasswordToken,
  verifyResetPasswordToken,
};
