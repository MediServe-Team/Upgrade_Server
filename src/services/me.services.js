import prisma from '../config/prisma.instance.js';
import { removeImg, storeImg } from '../helpers/cloudinary.js';
import createError from 'http-errors';
import bcrypt from 'bcrypt';
import { createResetPasswordToken } from '../helpers/jwt.service.js';
import { sendMail } from '../helpers/nodeMailer.js';
import { templateResetPassword, MAIL_RESET_PASSWORD_SUBJECT } from '../constant/mailTemplate.js';
import { passwordValidate } from '../helpers/validation.js';
import connectToRedis from '../config/redis.client.js';

export default {
  getUserById: async (id) => {
    try {
      const data = await prisma.user.findUnique({ where: { id } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  updateProfileById: async (id, userInvo) => {
    try {
      const { avatar, certificate, identityCard } = userInvo;
      const DEFAULT_AVATAR =
        'https://res.cloudinary.com/dwskvqnkc/image/upload/v1702204312/mediserve_image_store/avatar-default-icon_mfpilp.png';
      // user data update
      const userUpdate = {};
      userUpdate.name = userInvo?.name;
      userUpdate.fullName = userInvo?.fullName;
      userUpdate.gender = userInvo?.gender;
      userUpdate.age = userInvo?.age;
      userUpdate.dateOfBirth = userInvo?.dateOfBirth;
      userUpdate.phoneNumber = userInvo?.phoneNumber;
      userUpdate.avatar = userInvo?.avatar;
      userUpdate.address = userInvo?.address;
      userUpdate.certificate = userInvo?.certificate;
      userUpdate.identityCard = userInvo?.identityCard;
      userUpdate.numOfPPC = userInvo?.numOfPPC;

      // get before user data in Db
      const beforeUserData = await prisma.user.findFirst({
        where: { id },
        select: { avatar: true, certificate: true, identityCard: true },
      });

      if (avatar) {
        //* check update avatar
        if (avatar) {
          if (beforeUserData?.avatar && beforeUserData.avatar != DEFAULT_AVATAR) {
            try {
              await removeImg(beforeUserData.avatar);
            } catch (err) {
              throw createError('Remove avatar in cloud error!');
            }
          }
          // store new img
          const imgURL = await storeImg(avatar);
          userUpdate.avatar = imgURL.url;
        }
      }

      //* check store certificate
      if (certificate && beforeUserData?.certificate && certificate !== beforeUserData.certificate) {
        try {
          removeImg(beforeUserData.certificate);
        } catch (err) {
          throw createError('Remove image in cloud error!');
        }
        // store new img
        const imgURL = await storeImg(certificate);
        userUpdate.certificate = imgURL.url;
      }

      //* check store identityCard
      if (identityCard && beforeUserData?.identityCard && identityCard !== beforeUserData?.identityCard) {
        try {
          removeImg(beforeUserData.identityCard);
        } catch (err) {
          throw createError('Remove image in cloud error!');
        }
        // store new img
        const imgURL = await storeImg(identityCard);
        userUpdate.identityCard = imgURL.url;
      }

      const returnData = await prisma.user.update({
        data: userUpdate,
        where: {
          id,
        },
      });
      return Promise.resolve(returnData);
    } catch (err) {
      throw err;
    }
  },

  forGotPassword: async (email) => {
    try {
      //* check email aready exists
      const userInfo = await prisma.user.findUnique({ where: { email } });
      if (!userInfo) {
        throw createError.NotFound('Email does not exist.');
      }

      //* create reset password token
      const resetPassToken = await createResetPasswordToken(email);

      //* send to mail reset password url
      if (resetPassToken) {
        try {
          await sendMail(email, MAIL_RESET_PASSWORD_SUBJECT, templateResetPassword(userInfo.fullName, resetPassToken));
        } catch (err) {
          throw err;
        }
      }

      Promise.resolve(true);
    } catch (err) {
      throw err;
    }
  },

  resetUserPasswordByEmail: async (email, password) => {
    try {
      //* validate password
      const { error } = passwordValidate({ password });
      if (error) {
        throw createError(error.details[0].message);
      }

      //* hash password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      //* update password
      const userUpdated = await prisma.user.update({
        where: { email },
        data: { password: hashPassword },
      });

      //* delete token stored before in redis
      if (userUpdated) {
        const redis = await connectToRedis();
        await redis.del(email);
      }
    } catch (err) {
      throw err;
    }
  },

  userCheckin: async (userId) => {
    try {
      const currentDateTime = new Date();
      // time in
      const timeIn = new Date(currentDateTime);
      timeIn.setHours(timeIn.getHours() + 7);
      // time out default
      const timeOutDefault = new Date(currentDateTime);
      // timeOutDefault.setHours(timeOutDefault.getHours() + 7);
      timeOutDefault.setHours(24, 30, 0, 0);

      const checkin = await prisma.checkin.create({
        data: {
          userId,
          checkinTime: timeIn,
          checkoutTime: timeOutDefault,
          dateCheckin: currentDateTime,
        },
      });
      return checkin;
    } catch (err) {
      throw new createError.Conflict('Unique constraint user_id & date_checkin');
    }
  },

  userCheckout: async (userId) => {
    try {
      const currentDateTime = new Date();
      const existCheckin = await prisma.checkin.findFirst({ where: { dateCheckin: currentDateTime, userId } });
      if (!existCheckin) {
        throw new createError.BadRequest('User does not checkin today.');
      }
      const timeOut = new Date(currentDateTime);
      timeOut.setHours(timeOut.getHours() + 7);

      const checkin = await prisma.checkin.updateMany({
        data: { checkoutTime: timeOut },
        where: { dateCheckin: currentDateTime, userId: userId },
      });
      return checkin;
    } catch (err) {
      throw err;
    }
  },

  getListCheckin: async (userId, month, year) => {
    try {
      if (!month || !year) {
        throw new createError.BadRequest('Expected month and year in query params.');
      }
      const nextMonth = month == 12 ? 1 : Number(month) + 1;
      const nextYear = month == 12 ? Number(year) + 1 : Number(year);
      const firstDateOfMonth = new Date(`${year}-${month}-01`);
      const firstDateOfNextMonth = new Date(`${nextYear}-${nextMonth}-01`);

      // get list checkin in month, year
      const results = prisma.checkin.findMany({
        where: {
          AND: [
            { userId },
            {
              dateCheckin: {
                gte: firstDateOfMonth, // First date of month
                lt: firstDateOfNextMonth, // First date of next month
              },
            },
          ],
        },
        orderBy: { id: 'asc' },
      });

      return results;
    } catch (err) {
      throw err;
    }
  },
};
