import prisma from '../config/prisma.instance.js';
import { storeImg, removeImg } from '../helpers/cloudinary.js';

export default {
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
};
