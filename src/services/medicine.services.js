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
};
