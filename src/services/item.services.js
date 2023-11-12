import prisma from '../config/prisma.instance.js';

export default {
  filterItem: async (searchValue = '', itemType, categoryId) => {
    try {
      const itemResults = await prisma.item.findMany({
        where: {
          AND: [
            {
              OR: [
                { itemName: { contains: searchValue, mode: 'insensitive' } },
                { packingSpecification: { contains: searchValue, mode: 'insensitive' } },
              ],
            },
            categoryId ? { categoryId: Number(categoryId) } : {},
            itemType && ['PRODUCT', 'MEDICINE'].includes(itemType) ? { itemType } : {},
          ],
        },
      });
      return Promise.resolve(itemResults);
    } catch (err) {
      throw err;
    }
  },
};
