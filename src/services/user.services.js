import prisma from '../config/prisma.instance.js';
import createError from 'http-errors';

export default {
  getUserByEmail: async (email) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      return Promise.resolve(user);
    } catch (err) {
      throw err;
    }
  },

  getUserById: async (userId) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return Promise.resolve(user);
    } catch (err) {
      throw err;
    }
  },

  getPermisListOfUserById: async (userId) => {
    const permits = await prisma.permit.findMany({
      where: {
        userId,
      },
      select: {
        permission: {
          select: {
            id: true,
            permissionName: true,
          },
        },
      },
    });

    // get permission list Id
    const permitList = permits.reduce((acc, curr) => {
      acc.push(curr.permission['id']);
      return acc;
    }, []);

    return Promise.resolve(permitList);
  },

  getUserWithPerissionByEmail: async function (email) {
    try {
      const userResults = await prisma.user.findUnique({ where: { email } });
      // get permission list Id
      const permitList = await this.getPermisListOfUserById(userResults.id);

      // assign permitList for user result
      userResults.permitList = permitList;
      return Promise.resolve(userResults);
    } catch (err) {
      throw err;
    }
  },

  updateUserById: async (userId, dataUpdateInvo) => {
    try {
      const dataUpdate = {};
      dataUpdate.refreshToken = dataUpdateInvo.refreshToken ?? dataUpdateInvo.refreshToken;

      const userSaved = await prisma.user.update({
        where: {
          id: userId,
        },
        data: dataUpdate,
      });

      return Promise.resolve(userSaved);
    } catch (err) {
      throw err;
    }
  },

  createUser: async ({ email, password, name, fullName }) => {
    try {
      const user = {
        email,
        password,
        name,
        fullName,
      };

      const saveUser = await prisma.user.create({ data: user });

      return Promise.resolve(saveUser);
    } catch (err) {
      throw err;
    }
  },

  getAllUser: async () => {
    try {
      const data = await prisma.user.findMany({
        where: {
          role: { notIn: ['ADMIN'] },
        },
        select: {
          id: true,
          role: true,
          email: true,
          name: true,
          fullName: true,
          avatar: true,
        },
      });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  getUserInfo: async function (id) {
    try {
      const userResults = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      // get permission list Id
      const permitList = await this.getPermisListOfUserById(userResults.id);

      // assign permitList for user result
      userResults.permitList = permitList;

      // delete some field from data return
      delete userResults.password;
      delete userResults.refreshToken;
      return Promise.resolve(userResults);
    } catch (err) {
      throw err;
    }
  },

  deleteUserById: async (id) => {
    try {
      const returnData = await prisma.user.delete({
        where: {
          id,
        },
      });
      return Promise.resolve(returnData);
    } catch (err) {
      throw err;
    }
  },

  editUserById: async (id, userInvo) => {
    try {
      const userUpdate = {};
      //* user update data
      userUpdate.name = userInvo?.name;
      userUpdate.fullName = userInvo?.fullName;
      userUpdate.gender = userInvo?.gender;
      userUpdate.age = userInvo?.age;
      userUpdate.dateOfBirth = userInvo?.dateOfBirth;
      userUpdate.phoneNumber = userInvo?.phoneNumber;
      userUpdate.avatar = userInvo?.avatar;
      userUpdate.address = userInvo?.address;
      userUpdate.discount = userInvo?.discount;
      userUpdate.identityCard = userInvo?.identityCard;
      userUpdate.numOfPPC = userInvo?.numOfPPC;

      //* query user before data
      const beforeUserData = await prisma.user.findUnique({ where: { id } });

      //* update store user certificate Img
      if (userInvo?.certificate) {
        if (beforeUserData?.certificate) {
          try {
            removeImg(beforeUserData.certificate);
          } catch (err) {
            return;
          }
        }
        const imgStored = await storeImg(userInvo.certificate);
        userUpdate.certificate = imgStored.url;
      }

      //* update store user identityCard Img
      if (userInvo?.identityCard) {
        if (beforeUserData?.identityCard) {
          try {
            removeImg(beforeUserData.identityCard);
          } catch (err) {
            return;
          }
        }
        const imgStored = await storeImg(userInvo.identityCard);
        userUpdate.identityCard = imgStored.url;
      }

      //* query update user
      const userResult = await prisma.user.update({
        data: userUpdate,
        where: {
          id,
        },
      });

      return Promise.resolve(userResult);
    } catch (err) {
      throw err;
    }
  },

  updateRoleById: async (id, role) => {
    try {
      if (['USER', 'STAFF'].includes(role)) {
        const data = await prisma.user.update({
          data: {
            role,
          },
          where: {
            id,
          },
        });
        return Promise.resolve(data);
      }

      throw createError.BadRequest('input field "role" invalid');
    } catch (err) {
      throw err;
    }
  },
};
