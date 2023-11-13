import prisma from '../config/prisma.instance.js';

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

  getUserWithPerissionByEmail: async (email) => {
    try {
      const userResults = await prisma.user.findUnique({ where: { email } });
      // get all permits of user
      const permits = await prisma.permit.findMany({
        where: {
          userId: userResults.id,
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
};
