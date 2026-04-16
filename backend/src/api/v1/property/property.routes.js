import { Router } from 'express';

import {
    createPropertyController,
    updatePropertyController,
    deletePropertyController,
    getPropertiesController,
    getPropertyController,
} from './property.controller.js';
import {
    validateCreateProperty,
    validateUpdateProperty,
} from './property.validation.js';
import {
    authenticate,
    authorize,
    optionalAuthenticate,
} from '../../../middleware/auth.middleware.js';
import { uploadPropertyImages } from '../../../middleware/upload.middleware.js';
import parseFormData from '../../../middleware/parseFormData.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, getPropertiesController);

router.get('/:id', getPropertyController);

router.post(
    '/',
    authenticate,
    authorize(['agent']),
    uploadPropertyImages,
    parseFormData,
    validateCreateProperty,
    createPropertyController
);

router.put(
    '/:id',
    authenticate,
    authorize(['agent']),
    uploadPropertyImages,
    parseFormData,
    validateUpdateProperty,
    updatePropertyController
);

router.delete(
    '/:id',
    authenticate,
    authorize(['agent']),
    deletePropertyController
);

export default router;
