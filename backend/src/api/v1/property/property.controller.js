import logger from '../../../utils/logger.js';
import {
    errorResponse,
    successResponse,
    paginatedResponse,
} from '../../../utils/response.js';
import {
    createProperty,
    updateProperty,
    deleteProperty,
    getProperties,
    getProperty,
} from './property.service.js';

export const getPropertiesController = async (req, res) => {
    try {
        const queryParams = req.query;

        // Check if owner=me is requested
        if (queryParams.owner === 'me') {
            if (!req.user) {
                return errorResponse(
                    res,
                    'Authentication required for owner=me',
                    401
                );
            }
            if (req.user.role !== 'agent') {
                return errorResponse(
                    res,
                    'Only agents can use owner=me filter',
                    403
                );
            }
        }

        const result = await getProperties(queryParams, req.user);

        return paginatedResponse(
            res,
            { properties: result.properties },
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total,
            'Properties fetched successfully'
        );
    } catch (error) {
        logger.error({
            message: 'Property listing failed',
            error: error.message,
            queryParams: req.query,
            route: 'GET /api/v1/properties',
        });

        return errorResponse(
            res,
            error.message || 'Failed to fetch properties',
            error.status || 500
        );
    }
};

export const getPropertyController = async (req, res) => {
    try {
        const { id: propertyId } = req.params;

        if (!propertyId) {
            return errorResponse(res, 'Property ID is required', 400);
        }

        const property = await getProperty(propertyId);

        return successResponse(
            res,
            { property },
            'Property fetched successfully'
        );
    } catch (error) {
        logger.error({
            message: 'Property detail fetch failed',
            error: error.message,
            propertyId: req.params?.id,
            route: 'GET /api/v1/properties/:id',
        });

        const statusCode = error.status || 500;
        return errorResponse(
            res,
            error.message || 'Failed to fetch property',
            statusCode
        );
    }
};

export const createPropertyController = async (req, res) => {
    try {
        const agentId = req.user.userId;
        const uploadedFiles = req.files || [];

        logger.info(
            `Creating property | agentId: ${agentId} | fileCount: ${uploadedFiles.length}`
        );

        const propertyData = req.body;

        const property = await createProperty(
            propertyData,
            agentId,
            uploadedFiles
        );

        return successResponse(
            res,
            { property },
            'Property created successfully'
        );
    } catch (error) {
        logger.error({
            message: 'Property creation failed',
            error: error.message,
            agentId: req.user?.userId,
            route: '/api/v1/properties',
        });

        return errorResponse(
            res,
            error.message || 'Property creation failed',
            error.status || 500
        );
    }
};

export const updatePropertyController = async (req, res) => {
    try {
        const { id: propertyId } = req.params;
        const agentId = req.user.userId;
        const uploadedFiles = req.files || [];
        const propertyData = req.body;

        if (!propertyId) {
            return errorResponse(res, 'Property ID is required', 400);
        }

        const property = await updateProperty(
            propertyId,
            agentId,
            propertyData,
            uploadedFiles
        );

        return successResponse(
            res,
            { property },
            'Property updated successfully'
        );
    } catch (error) {
        logger.error({
            message: 'Property update failed',
            error: error.message,
            propertyId: req.params?.id,
            agentId: req.user?.userId,
            route: '/api/v1/properties/:id',
        });

        const statusCode = error.status || 500;
        return errorResponse(
            res,
            error.message || 'Property update failed',
            statusCode
        );
    }
};

export const deletePropertyController = async (req, res) => {
    try {
        const { id: propertyId } = req.params;
        const agentId = req.user.userId;

        if (!propertyId) {
            return errorResponse(res, 'Property ID is required', 400);
        }

        const result = await deleteProperty(propertyId, agentId);

        return successResponse(res, result, 'Property deleted successfully');
    } catch (error) {
        logger.error({
            message: 'Property deletion failed',
            error: error.message,
            propertyId: req.params?.id,
            agentId: req.user?.userId,
            route: 'DELETE /api/v1/properties/:id',
        });

        const statusCode = error.status || 500;
        return errorResponse(
            res,
            error.message || 'Property deletion failed',
            statusCode
        );
    }
};
