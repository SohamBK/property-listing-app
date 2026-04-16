import prisma from '../../../config/prisma.js';
import logger from '../../../utils/logger.js';

export const createEnquiry = async (enquiryData, userId = null) => {
    const { name, email, phone, message, propertyId } = enquiryData;

    // Verify property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
            id: true,
            title: true,
            location: true,
            agentId: true,
        },
    });

    if (!property) {
        const error = new Error('Property not found');
        error.status = 404;
        throw error;
    }

    // Create enquiry
    const enquiry = await prisma.enquiry.create({
        data: {
            name,
            email,
            phone,
            message,
            propertyId,
            userId,
        },
        include: {
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    type: true,
                    listingType: true,
                },
            },
            user: userId
                ? {
                      select: {
                          id: true,
                          name: true,
                          email: true,
                      },
                  }
                : false,
        },
    });

    logger.info({
        message: 'Enquiry created successfully',
        enquiryId: enquiry.id,
        propertyId,
        propertyTitle: property.title,
        userId,
        isGuest: !userId,
        agentId: property.agentId,
    });

    return enquiry;
};

export const getEnquiriesByProperty = async (propertyId, agentId) => {
    // Verify property exists and belongs to agent
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
            id: true,
            title: true,
            agentId: true,
        },
    });

    if (!property) {
        const error = new Error('Property not found');
        error.status = 404;
        throw error;
    }

    // Check authorization
    if (property.agentId !== agentId) {
        const error = new Error(
            'You are not authorized to view enquiries for this property'
        );
        error.status = 403;
        throw error;
    }

    // Fetch enquiries
    const enquiries = await prisma.enquiry.findMany({
        where: { propertyId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            message: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    logger.info({
        message: 'Enquiries fetched successfully',
        propertyId,
        propertyTitle: property.title,
        agentId,
        enquiryCount: enquiries.length,
    });

    return enquiries;
};
