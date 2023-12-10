import prisma from '../config/prisma.instance.js';

export default {
  filterItemInStock: async (searchValue, itemType) => {
    try {
      let itemInStockResults = await prisma.itemInStock.findMany({
        where: {
          destroyed: false,
          item: {
            itemName: { contains: searchValue, mode: 'insensitive' },
            ...(itemType && ['PRODUCT', 'MEDICINE'].includes(itemType) ? { itemType } : {}),
          },
        },
        select: {
          itemInStockId: true,
          importQuantity: true,
          importPrice: true,
          sellPrice: true,
          soldQuantity: true,
          expirationDate: true,
          item: {
            select: {
              id: true,
              itemName: true,
              sellUnit: true,
              packingSpecification: true,
            },
          },
        },
      });

      // filter product has quantity > 0
      itemInStockResults = itemInStockResults.filter((item) => {
        const expDate = new Date(item.expirationDate);
        const currentDate = new Date();
        // milestoneDate is 15 days before expiration date
        const milestoneDate = new Date(expDate.getTime() - 15 * 24 * 60 * 60 * 1000);

        return (
          // 1. check item don't prepare expired
          currentDate <= milestoneDate &&
          // 2. check item has enough quantity in stock
          item.importQuantity - item.soldQuantity > 0
        );
      });
      return Promise.resolve(itemInStockResults);
    } catch (err) {
      throw err;
    }
  },
};
