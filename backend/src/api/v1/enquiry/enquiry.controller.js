import logger from '../../../utils/logger.js';
import { errorResponse, successResponse } from '../../../utils/response.js';
import { createEnquiry, getEnquiriesByProperty } from './enquiry.service.js';

export const createEnquiryController = async (req, res) => {
    try {
        // Extract userId if authenticated, null for guests
        const userId = req.user?.userId || null;

        const enquiryData = req.body;

        const enquiry = await createEnquiry(enquiryData, userId);

        return successResponse(
            res,
            { enquiry },
            'Enquiry submitted successfully'
        );
    } catch (error) {
        logger.error({
            message: 'Enquiry creation failed',
            error: error.message,
            userId: req.user?.userId,
            propertyId: req.body?.propertyId,
            route: '/api/v1/enquiries',
            isGuest: !req.user?.userId,
        });

        const statusCode = error.status || 500;
        return errorResponse(
            res,
            error.message || 'Failed to submit enquiry',
            statusCode
        );
    }
};

export const getEnquiriesByPropertyController = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const agentId = req.user.userId;

        const enquiries = await getEnquiriesByProperty(propertyId, agentId);

        return successResponse(
            res,
            { enquiries },
            'Enquiries retrieved successfully'
        );
    } catch (error) {
        logger.error({
            message: 'Failed to fetch enquiries',
            error: error.message,
            agentId: req.user?.userId,
            propertyId: req.params?.propertyId,
            route: '/api/v1/enquiries/property/:propertyId',
        });

        const statusCode = error.status || 500;
        return errorResponse(
            res,
            error.message || 'Failed to fetch enquiries',
            statusCode
        );
    }
};

