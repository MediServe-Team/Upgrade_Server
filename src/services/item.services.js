import prisma from '../config/prisma.instance.js';
import createError from 'http-errors';

export default {
  filterItem: async (searchValue = '', categoryId) => {
    try {
      if (!categoryId) {
        throw createError.ExpectationFailed('expected "categoryId" in request!');
      }
      // query filter item
      const itemResults = await prisma.item.findMany({
        where: {
          AND: [
            {
              OR: [
                { itemName: { contains: searchValue, mode: 'insensitive' } },
                { packingSpecification: { contains: searchValue, mode: 'insensitive' } },
              ],
            },
            { categoryId: Number(categoryId) },
          ],
        },
      });
      return Promise.resolve(itemResults);
    } catch (err) {
      throw err;
    }
  },
};
