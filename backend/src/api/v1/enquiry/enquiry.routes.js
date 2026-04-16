import { Router } from 'express';

import {
    createEnquiryController,
    getEnquiriesByPropertyController,
} from './enquiry.controller.js';
import { validateCreateEnquiry } from './enquiry.validation.js';
import {
    authenticate,
    authorize,
} from '../../../middleware/auth.middleware.js';

const router = Router();

router.post('/', validateCreateEnquiry, createEnquiryController);

router.get(
    '/property/:propertyId',
    authenticate,
    authorize(['agent']),
    getEnquiriesByPropertyController
);

export default router;
