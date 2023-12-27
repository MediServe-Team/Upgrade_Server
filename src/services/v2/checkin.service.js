import prisma from '../../config/prisma.instance.js';
import createError from 'http-errors';

export default {
  getCheckinToday: async (userId) => {
    try {
      const currentDate = new Date();
      const checkinToday = await prisma.checkin.findFirst({ where: { userId, dateCheckin: currentDate } });
      return checkinToday;
    } catch (err) {
      throw err;
    }
  },
};
