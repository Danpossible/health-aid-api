import Joi from 'joi';

export const updateKyc = {
  body: Joi.object().keys({
    kyc: Joi.object()
      .keys({
        driversLicense: Joi.object()
          .keys({
            number: Joi.number().required(),
            image: Joi.string().required().uri(),
          })
          .required(),
        medicalLicense: Joi.object()
          .keys({
            number: Joi.number().required(),
            image: Joi.string().required().uri(),
          })
          .required(),
        medicalCertificate: Joi.object()
          .keys({
            image: Joi.string().required().uri(),
          })
          .required(),
        certifications: Joi.array()
          .items(
            Joi.object().keys({
              name: Joi.string().optional(),
              image: Joi.string().optional().uri(),
            }),
          )
          .optional(),
      })
      .required(),
    specialization: Joi.array().items(Joi.string().optional()),
    experience: Joi.array().items(Joi.string().optional()),
    location: Joi.object().keys({
      latitude: Joi.number().optional(),
      longitude: Joi.number().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      address: Joi.string().optional(),
    }),
  }),
};
