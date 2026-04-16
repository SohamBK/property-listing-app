import { Router } from 'express';

import authRoutes from '../api/v1/auth/auth.routes.js';
import enquiryRoutes from '../api/v1/enquiry/enquiry.routes.js';
import healthRoutes from '../api/v1/health/health.routes.js';
import propertyRoutes from '../api/v1/property/property.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/health', healthRoutes);
router.use('/properties', propertyRoutes);

export default router;
