import Joi from 'joi';
import validate from '../../../middleware/validation.middleware.js';

const configurationSchema = Joi.object({
    bhk: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required(),
    unitSize: Joi.string().min(1).max(50).required(),
});

const createPropertySchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    subtitle: Joi.string().max(300).optional(),
    description: Joi.string().min(10).max(2000).required(),
    type: Joi.string().valid('RESIDENTIAL', 'COMMERCIAL').required(),
    listingType: Joi.string().valid('SALE', 'RESALE', 'NEW_LAUNCH').required(),
    location: Joi.string().min(2).max(100).required(),
    possessionDate: Joi.date().optional(),
    configurations: Joi.array().items(configurationSchema).min(1).required(),
});

const updatePropertySchema = Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    subtitle: Joi.string().max(300).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    type: Joi.string().valid('RESIDENTIAL', 'COMMERCIAL').optional(),
    listingType: Joi.string().valid('SALE', 'RESALE', 'NEW_LAUNCH').optional(),
    location: Joi.string().min(2).max(100).optional(),
    possessionDate: Joi.date().optional(),
    configurations: Joi.array().items(configurationSchema).min(1).optional(),
});

export const validateCreateProperty = validate(createPropertySchema);
export const validateUpdateProperty = validate(updatePropertySchema);
