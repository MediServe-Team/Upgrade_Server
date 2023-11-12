import jwt from 'jsonwebtoken';
import createError from 'http-errors';

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

export {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  verifyAdminAccess,
  verifyStaffAdminAccess,
};
