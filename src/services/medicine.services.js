import prisma from '../config/prisma.instance.js';
import { storeImg, removeImg } from '../helpers/cloudinary.js';

export default {
  getMedicineByCategory: async (categoryId, pageNumber, limit, searchValue = '') => {
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
              itemType: 'MEDICINE',
            },
            skip,
            take: Number(limit),
          });
          totalRows = await prisma.item.count({
            where: {
              OR: [...searchCondition],
              itemType: 'MEDICINE',
            },
          });
          break;

        case 'prescription':
          data = await prisma.item.findMany({
            where: {
              isPrescription: true,
              itemType: 'MEDICINE',
              OR: [...searchCondition],
            },
            skip,
            take: Number(limit),
          });
          totalRows = await prisma.item.count({
            where: { isPrescription: true, itemType: 'MEDICINE', OR: [...searchCondition] },
          });
          break;

        case 'non-prescription':
          data = await prisma.item.findMany({
            where: {
              isPrescription: false,
              itemType: 'MEDICINE',
              OR: [...searchCondition],
            },
            skip,
            take: Number(limit),
          });
          totalRows = await prisma.item.count({
            where: { isPrescription: false, itemType: 'MEDICINE', OR: [...searchCondition] },
          });
          break;

        default:
          data = await prisma.item.findMany({
            where: {
              OR: [...searchCondition],
              category: { id: Number(categoryId) },
              itemType: 'MEDICINE',
            },
            skip,
            take: Number(limit),
          });
          totalRows = await prisma.item.count({
            where: {
              OR: [...searchCondition],
              category: { id: Number(categoryId) },
              itemType: 'MEDICINE',
            },
          });
          break;
      }

      return Promise.resolve({ medicines: data, totalPage: Math.ceil(totalRows / limit), currentpage: pageNumber });
    } catch (err) {
      throw err;
    }
  },

  getAllMedicine: async (pageNumber, limit) => {
    try {
      if (!pageNumber || !limit) {
        throw createError.ExpectationFailed('Expected "pageNumber" and "limit" in request.');
      }
      const skip = (Number(pageNumber) - 1) * Number(limit);
      let getMedicines = () => {
        return new Promise(async (resolve) => {
          const medicineServices = await prisma.item.findMany({
            where: { itemType: 'MEDICINE' },
            skip: Number(skip),
            take: Number(limit),
          });
          resolve(medicineServices);
        });
      };
      let countTotalMedicine = () => {
        return new Promise(async (resolve) => {
          const totalMedicines = await prisma.item.count({ where: { itemType: 'MEDICINE' } });
          resolve(totalMedicines);
        });
      };
      const data = await Promise.all([getMedicines(), countTotalMedicine()]);

      return Promise.resolve({ medicines: data[0], currentPage: pageNumber, totalPage: Math.ceil(data[1] / limit) });
    } catch (err) {
      throw err;
    }
  },

  getMedicineById: async (id) => {
    try {
      const data = await prisma.item.findUnique({ where: { id: Number(id), itemType: 'MEDICINE' } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  createMedicine: async (medicineInvo) => {
    try {
      // medicine data
      const medicineCreate = {};

      // medicine create data
      medicineCreate.categoryId = medicineInvo?.categoryId ?? Number(medicineInvo.categoryId);
      medicineCreate.itemName = medicineInvo?.medicineName;
      medicineCreate.registrationNumber = medicineInvo?.registrationNumber;
      medicineCreate.dosageForm = medicineInvo?.dosageForm;
      medicineCreate.productContent = medicineInvo?.productContent;
      medicineCreate.chemicalName = medicineInvo?.chemicalName;
      medicineCreate.chemicalCode = medicineInvo?.chemicalCode;
      medicineCreate.packingSpecification = medicineInvo?.packingSpecification;
      medicineCreate.sellUnit = medicineInvo?.sellUnit;
      medicineCreate.inputUnit = medicineInvo?.inputUnit;
      medicineCreate.itemFunction = medicineInvo?.medicineFunction;
      medicineCreate.applyToAffectedArea = medicineInvo?.applyToAffectedArea;
      medicineCreate.applyToAffectedAreaCode = medicineInvo?.applyToAffectedAreaCode;
      medicineCreate.note = medicineInvo?.note;
      medicineCreate.isPrescription = medicineInvo?.isPrescription;
      medicineCreate.itemType = 'MEDICINE';

      // store image to cloud
      const promiseStoreImgs = [];
      const { medicineImage, barCode } = medicineInvo;

      if (medicineImage) {
        promiseStoreImgs.push(
          storeImg(medicineImage)
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

      // assign img url for medicine create
      await Promise.all(promiseStoreImgs)
        .then((results) => {
          results.forEach((result) => {
            if (result['itemImage']) medicineCreate.itemImage = result['itemImage'];
            if (result['barCode']) medicineCreate.barCode = result['barCode'];
          });
        })
        .catch((e) => {
          throw e;
        });

      // save medicine
      const medicineResults = await prisma.item.create({
        data: medicineCreate,
      });

      return Promise.resolve(medicineResults);
    } catch (err) {
      throw err;
    }
  },

  updateMedicineById: async (id, medicineInvo) => {
    try {
      // medicine data
      const medicineUpdate = {};
      const { barCode, medicineImage } = medicineInvo;

      // medicine update data
      medicineUpdate.categoryId = medicineInvo?.categoryId ?? Number(medicineInvo.categoryId);
      medicineUpdate.itemName = medicineInvo?.medicineName;
      medicineUpdate.registrationNumber = medicineInvo?.registrationNumber;
      medicineUpdate.dosageForm = medicineInvo?.dosageForm;
      medicineUpdate.productContent = medicineInvo?.productContent;
      medicineUpdate.chemicalName = medicineInvo?.chemicalName;
      medicineUpdate.chemicalCode = medicineInvo?.chemicalCode;
      medicineUpdate.packingSpecification = medicineInvo?.packingSpecification;
      medicineUpdate.sellUnit = medicineInvo?.sellUnit;
      medicineUpdate.inputUnit = medicineInvo?.inputUnit;
      medicineUpdate.itemFunction = medicineInvo?.medicineFunction;
      medicineUpdate.applyToAffectedArea = medicineInvo?.applyToAffectedArea;
      medicineUpdate.applyToAffectedAreaCode = medicineInvo?.applyToAffectedAreaCode;
      medicineUpdate.note = medicineInvo?.note;
      medicineUpdate.isPrescription = medicineInvo?.isPrescription;

      //* check barcode and medicineImg in medicine before update
      const medicineBefore = await prisma.item.findFirst({
        where: { id: Number(id) },
        select: { barCode: true, itemImage: true },
      });

      //* update store barcode
      if (barCode) {
        if (medicineBefore.barCode) {
          try {
            removeImg(medicineBefore.barCode);
          } catch (err) {
            return;
          }
        }
        const imgStored = await storeImg(barCode);
        medicineUpdate.barCode = imgStored.url;
      }

      //* update store medicine Img
      if (medicineImage) {
        if (medicineBefore.itemImage) {
          try {
            removeImg(medicineBefore.itemImage);
          } catch (err) {
            return;
          }
        }
        const imgStored = await storeImg(medicineImage);
        medicineUpdate.itemImage = imgStored.url;
      }

      //* update medicine
      const data = await prisma.item.update({ data: medicineUpdate, where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  deleteMedicineById: async (id) => {
    try {
      // remove image from cloud
      (async () => {
        const medicine = await prisma.item.findFirst({
          where: { id: Number(id) },
          select: { itemImage: true, barCode: true },
        });
        if (medicine?.itemImage) {
          try {
            removeImg(medicine.itemImage);
          } catch (err) {
            return;
          }
        }
        if (medicine?.barCode) {
          try {
            removeImg(medicine.barCode);
          } catch (err) {
            return;
          }
        }
      })();
      // delete medicine
      const data = await prisma.item.delete({ where: { id: Number(id) } });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },
};
