import Joi from 'joi';
import validate from '../../../middleware/validation.middleware.js';

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
        .pattern(/^[0-9+\-\s()]{10,}$/)
        .required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('agent', 'user').required(),
    businessName: Joi.when('role', {
        is: 'agent',
        then: Joi.string().min(2).max(100).required(),
        otherwise: Joi.forbidden(),
    }),
    address: Joi.when('role', {
        is: 'agent',
        then: Joi.string().min(5).max(255).required(),
        otherwise: Joi.forbidden(),
    }),
    location: Joi.when('role', {
        is: 'agent',
        then: Joi.string().min(2).max(100).required(),
        otherwise: Joi.forbidden(),
    }),
    expertise: Joi.when('role', {
        is: 'agent',
        then: Joi.string().valid('NEW_LAUNCH', 'RENT', 'RESALE').required(),
        otherwise: Joi.forbidden(),
    }),
});

export const validateLogin = validate(loginSchema);
export const validateRegister = validate(registerSchema);
