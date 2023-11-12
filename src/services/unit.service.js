import prisma from '../config/prisma.instance.js';

export default {
  getAllUnit: async () => {
    try {
      const data = await prisma.unit.findMany();
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  createNewUnit: async (unitInvo) => {
    try {
      const data = await prisma.unit.create({ data: unitInvo });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  deleteUnitById: async (id) => {
    try {
      const data = await prisma.unit.delete({ where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },
};
