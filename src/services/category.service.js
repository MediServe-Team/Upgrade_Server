import prisma from '../config/prisma.instance.js';
import createError from 'http-errors';

export default {
  getAllCategory: async () => {
    try {
      const data = await prisma.category.findMany();
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  getCategoryById: async (id) => {
    try {
      const data = await prisma.category.findUnique({
        where: { id: Number(id) },
      });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  createCategory: async (newData) => {
    try {
      const returnData = await prisma.category.create({
        data: newData,
      });
      return Promise.resolve(returnData);
    } catch (err) {
      throw err;
    }
  },

  updateCategoryById: async (id, newData) => {
    try {
      // check category diffrence default type
      const categoryData = await prisma.category.findUnique({ where: { id: Number(id) } });
      if (categoryData.isDefault === true) {
        throw createError[405]('Can not update category default of system.');
      }
      const data = await prisma.category.update({ data: newData, where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  deleteCategoryById: async (id) => {
    try {
      const data = await prisma.category.delete({ where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },
};
