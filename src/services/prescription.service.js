import prisma from '../config/prisma.instance.js';

export default {
  createNewPrescription: async (prescriptionInvo, medicineInvos) => {
    try {
      const prescriptionCreate = {};
      //* prescription data create
      prescriptionCreate.staffId = prescriptionInvo?.staffId;
      prescriptionCreate.diagnose = prescriptionInvo?.diagnose;
      prescriptionCreate.isDose = prescriptionInvo?.isDose ?? true;
      prescriptionCreate.note = prescriptionInvo?.note;

      //* create prisma transaction
      const transaction = await prisma.$transaction(async (tx) => {
        //* create prescription
        const prescriptionResult = await tx.prescription.create({
          data: prescriptionCreate,
        });

        //* create many medicine guide
        const medicineGuideCreates = medicineInvos.map((guide) => ({
          medicineId: Number(guide?.medicineId),
          prescriptionId: Number(prescriptionResult.id),
          morning: Number(guide?.morning),
          noon: Number(guide?.noon),
          night: Number(guide?.night),
          quantity: Number(guide?.quantity),
          note: guide?.note,
        }));
        const medicineGuideResults = await tx.medicineGuide.createMany({ data: medicineGuideCreates });

        return Promise.resolve({ newPrescription: prescriptionResult, newGuide: medicineGuideResults });
      });

      return Promise.resolve(transaction);
    } catch (err) {
      throw err;
    }
  },

  updatePrescription: async (id, prescriptionInvo, medicineInvos) => {
    try {
      const prescriptionUpdate = {};
      //* prescription data update
      prescriptionUpdate.diagnose = prescriptionInvo?.diagnose;
      prescriptionUpdate.note = prescriptionInvo?.note;

      //* medicine guide data create
      const medicineGuideCreates = medicineInvos.map((guide) => ({
        medicineId: Number(guide?.medicineId),
        prescriptionId: Number(id),
        morning: Number(guide?.morning),
        noon: Number(guide?.noon),
        night: Number(guide?.night),
        quantity: Number(guide?.quantity),
        note: guide?.note,
      }));

      //* create prisma transaction
      const transaction = await prisma.$transaction(async (tx) => {
        //* update prescription
        const prescriptionUpdateResult = await tx.prescription.update({
          where: {
            id: Number(id),
          },
          data: prescriptionUpdate,
        });

        //* delete before data medicine guide
        const medicineDeleteResults = await tx.medicineGuide.deleteMany({
          where: {
            prescriptionId: Number(id),
          },
        });

        //* create many medicine guide
        const medicineGuideCreateResults = await tx.medicineGuide.createMany({ data: medicineGuideCreates });

        return Promise.resolve({ prescriptionUpdateResult, medicineDeleteResults, medicineGuideCreateResults });
      });

      return Promise.resolve(transaction);
    } catch (err) {
      throw err;
    }
  },
};
