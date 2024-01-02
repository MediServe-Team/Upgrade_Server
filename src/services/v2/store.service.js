import prisma from '../../config/prisma.instance.js';
import createError from 'http-errors';

export default {
  setActivityStore: async (isOpen) => {
    try {
      if (isOpen === null || isOpen === '') {
        throw createError.BadRequest('Expected isOpen field in body request');
      }
      await prisma.store.update({ where: { id: 1 }, data: { isOpen: isOpen } });
    } catch (err) {
      throw err;
    }
  },

  getActivityStore: async () => {
    try {
      return await prisma.store.findFirst({ where: { id: 1 } });
    } catch (err) {
      throw err;
    }
  },
};
