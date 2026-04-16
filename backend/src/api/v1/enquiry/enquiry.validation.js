import Joi from 'joi';
import validate from '../../../middleware/validation.middleware.js';

const createEnquirySchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
    }),
    phone: Joi.string().min(10).max(15).required().messages({
        'string.empty': 'Phone number is required',
        'string.min': 'Phone number must be at least 10 characters long',
        'string.max': 'Phone number cannot exceed 15 characters',
    }),
    message: Joi.string().min(1).max(1000).optional().empty('').messages({
        'string.min': 'Message cannot be empty',
        'string.max': 'Message cannot exceed 1000 characters',
    }),
    propertyId: Joi.string().uuid().required().messages({
        'string.empty': 'Property ID is required',
        'string.uuid': 'Please provide a valid property ID',
    }),
});

export const validateCreateEnquiry = validate(createEnquirySchema);
