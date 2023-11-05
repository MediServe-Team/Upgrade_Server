import prisma from '../config/prisma.instance.js';
import createError from 'http-errors';
import { storeImg, removeImg } from '../helpers/cloudinary.js';

export default {
  getProductByCategory: async (categoryId, pageNumber, limit, searchValue = '') => {
    try {
      if (!categoryId) {
        throw createError.ExpectationFailed('expected categoryId in request.');
      }
      let data;
      let totalRows;
      const skip = pageNumber && limit ? (Number(pageNumber) - 1) * Number(limit) : undefined;
      const searchCondition = [
        { itemName: { contains: searchValue, mode: 'insensitive' } },
        { packingSpecification: { contains: searchValue, mode: 'insensitive' } },
      ];

      switch (categoryId) {
        case 'all':
          data = await prisma.item.findMany({
            where: {
              OR: [...searchCondition],
              itemType: 'PRODUCT',
            },
            skip,
            take: Number(limit),
          });
          totalRows = await prisma.item.count({
            where: {
              OR: [...searchCondition],
              itemType: 'PRODUCT',
            },
          });
          break;

        default:
          data = await prisma.item.findMany({
            where: {
              OR: [...searchCondition],
              category: { id: Number(categoryId) },
              itemType: 'PRODUCT',
            },
            skip,
            take: Number(limit),
          });
          totalRows = await prisma.item.count({
            where: {
              OR: [...searchCondition],
              category: { id: Number(categoryId) },
              itemType: 'PRODUCT',
            },
          });
          break;
      }

      return Promise.resolve({ products: data, totalPage: Math.ceil(totalRows / limit), currentpage: pageNumber });
    } catch (err) {
      throw err;
    }
  },

  getAllProduct: async (pageNumber, limit) => {
    try {
      if (!pageNumber || !limit) {
        throw createError.ExpectationFailed('Expected "pageNumber" and "limit" in request.');
      }
      const skip = (Number(pageNumber) - 1) * Number(limit);
      let getProducts = () => {
        return new Promise(async (resolve) => {
          const products = await prisma.item.findMany({
            where: { itemType: 'PRODUCT' },
            skip: Number(skip),
            take: Number(limit),
          });
          resolve(products);
        });
      };
      let countTotalProduct = () => {
        return new Promise(async (resolve) => {
          const totalProducts = await prisma.item.count({ where: { itemType: 'PRODUCT' } });
          resolve(totalProducts);
        });
      };
      const data = await Promise.all([getProducts(), countTotalProduct()]);

      return Promise.resolve({ products: data[0], currentPage: pageNumber, totalPage: Math.ceil(data[1] / limit) });
    } catch (err) {
      throw err;
    }
  },

  getProductById: async (id) => {
    try {
      const data = await prisma.item.findUnique({ where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  createProduct: async (productInvo) => {
    try {
      // product data
      const productCreate = {};

      // product create data
      productCreate.categoryId = productInvo?.categoryId ?? Number(productInvo.categoryId);
      productCreate.itemName = productInvo?.productName;
      productCreate.registrationNumber = productInvo?.registrationNumber;
      productCreate.dosageForm = productInvo?.dosageForm;
      productCreate.productContent = productInvo?.productContent;
      productCreate.chemicalName = productInvo?.chemicalName;
      productCreate.chemicalCode = productInvo?.chemicalCode;
      productCreate.packingSpecification = productInvo?.packingSpecification;
      productCreate.sellUnit = productInvo?.sellUnit;
      productCreate.inputUnit = productInvo?.inputUnit;
      productCreate.itemFunction = productInvo?.productFunction;
      productCreate.note = productInvo?.note;
      productCreate.itemType = 'PRODUCT';

      // store image to cloud
      const promiseStoreImgs = [];
      const { productImage, barCode } = productInvo;

      if (productImage) {
        promiseStoreImgs.push(
          storeImg(productImage)
            .then((result) => ({ itemImage: result.url }))
            .catch((err) => {
              throw err;
            }),
        );
      }

      if (barCode) {
        promiseStoreImgs.push(
          storeImg(barCode)
            .then((result) => ({ barCode: result.url }))
            .catch((err) => {
              throw err;
            }),
        );
      }

      // assign img url for product create
      await Promise.all(promiseStoreImgs)
        .then((results) => {
          results.forEach((result) => {
            if (result['itemImage']) productCreate.itemImage = result['itemImage'];
            if (result['barCode']) productCreate.barCode = result['barCode'];
          });
        })
        .catch((e) => {
          throw e;
        });

      // save product
      const productResults = await prisma.item.create({
        data: productCreate,
      });

      return Promise.resolve(productResults);
    } catch (err) {
      throw err;
    }
  },

  updateProductById: async (id, productInvo) => {
    try {
      // product data
      const productUpdate = {};
      const { barCode, productImage } = productInvo;

      // product update data
      productUpdate.categoryId = productInvo?.categoryId ?? Number(productInvo.categoryId);
      productUpdate.itemName = productInvo.productName;
      productUpdate.registrationNumber = productInvo.registrationNumber;
      productUpdate.dosageForm = productInvo.dosageForm;
      productUpdate.productContent = productInvo.productContent;
      productUpdate.chemicalName = productInvo.chemicalName;
      productUpdate.chemicalCode = productInvo.chemicalCode;
      productUpdate.packingSpecification = productInvo.packingSpecification;
      productUpdate.sellUnit = productInvo.sellUnit;
      productUpdate.inputUnit = productInvo.inputUnit;
      productUpdate.itemFunction = productInvo.productFunction;
      productUpdate.note = productInvo.note;

      //* check barcode and productImg in product before update
      const productBefore = await prisma.item.findFirst({
        where: { id: Number(id) },
        select: { barCode: true, itemImage: true },
      });

      //* update store barcode
      if (barCode) {
        if (productBefore.barCode) {
          try {
            removeImg(productBefore.barCode);
          } catch (err) {
            return;
          }
        }
        const imgStored = await storeImg(barCode);
        productUpdate.barCode = imgStored.url;
      }

      //* update store product Img
      if (productImage) {
        if (productBefore.itemImage) {
          try {
            removeImg(productBefore.itemImage);
          } catch (err) {
            return;
          }
        }
        const imgStored = await storeImg(productImage);
        productUpdate.itemImage = imgStored.url;
      }

      //* update product
      const data = await prisma.item.update({ data: productUpdate, where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  deleteProducById: async (id) => {
    try {
      // remove image from cloud
      (async () => {
        const product = await prisma.item.findFirst({
          where: { id: Number(id) },
          select: { itemImage: true, barCode: true },
        });
        if (product?.itemImage) {
          try {
            removeImg(product.itemImage);
          } catch (err) {
            return;
          }
        }
        if (product?.barCode) {
          try {
            removeImg(product.barCode);
          } catch (err) {
            return;
          }
        }
      })();
      // delete product
      const data = await prisma.item.delete({ where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },
};
