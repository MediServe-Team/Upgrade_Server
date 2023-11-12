import prisma from '../config/prisma.instance.js';
import { removeImg, storeImg } from '../helpers/cloudinary.js';

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
        'https://res.cloudinary.com/dwskvqnkc/image/upload/v1681721772/samples/MediSever/default-avatar_ahyatj.png';

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
      if (certificate) {
        if (beforeUserData?.certificate) {
          try {
            removeImg(beforeUserData.certificate);
          } catch (err) {
            throw createError('Remove image in cloud error!');
          }
        }
        // store new img
        const imgURL = await storeImg(certificate);
        userUpdate.certificate = imgURL.url;
      }

      //* check store identityCard
      if (identityCard) {
        if (beforeUserData?.identityCard) {
          try {
            removeImg(beforeUserData.identityCard);
          } catch (err) {
            throw createError('Remove image in cloud error!');
          }
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
};
