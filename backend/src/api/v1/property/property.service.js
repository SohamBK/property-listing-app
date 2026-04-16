import prisma from '../../../config/prisma.js';
import logger from '../../../utils/logger.js';
import fs from 'fs';
import path from 'path';

export const getProperties = async (queryParams, user = null) => {
    const {
        location,
        bhk,
        minPrice,
        maxPrice,
        type,
        listingType,
        owner,
        page = 1,
        limit = 10,
    } = queryParams;

    const where = {};

    // Owner filter for agents
    if (owner === 'me' && user && user.role === 'agent') {
        where.agentId = user.userId;
    }

    // Location search (partial match, case-insensitive)
    if (location) {
        where.location = {
            contains: location,
            mode: 'insensitive',
        };
    }

    // Property type filter
    if (type) {
        where.type = type;
    }

    // Listing type filter
    if (listingType) {
        where.listingType = listingType;
    }

    const configurationFilters = {};

    if (bhk) {
        configurationFilters.bhk = parseInt(bhk);
    }

    if (minPrice || maxPrice) {
        configurationFilters.price = {};
        if (minPrice) {
            configurationFilters.price.gte = parseFloat(minPrice);
        }
        if (maxPrice) {
            configurationFilters.price.lte = parseFloat(maxPrice);
        }
    }

    if (Object.keys(configurationFilters).length > 0) {
        where.configurations = {
            some: configurationFilters,
        };
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            where,
            include: {
                configurations: true,
                media: true,
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        businessName: true,
                        phone: true,
                    },
                },
            },
            skip,
            take: limitNum,
            orderBy: {
                createdAt: 'desc',
            },
        }),
        prisma.property.count({
            where,
        }),
    ]);

    logger.info({
        message: 'Properties fetched successfully',
        filters: {
            owner,
            location,
            bhk,
            minPrice,
            maxPrice,
            type,
            listingType,
        },
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
        resultCount: properties.length,
        userId: user?.userId,
    });

    return {
        properties,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};

export const getProperty = async (propertyId) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            configurations: true,
            media: {
                orderBy: {
                    order: 'asc',
                },
            },
            agent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    businessName: true,
                },
            },
        },
    });

    if (!property) {
        const error = new Error('Property not found');
        error.status = 404;
        throw error;
    }

    logger.info({
        message: 'Property detail fetched successfully',
        propertyId,
        title: property.title,
        agentId: property.agentId,
        configurationsCount: property.configurations.length,
        mediaCount: property.media.length,
    });

    return property;
};

export const createProperty = async (
    propertyData,
    agentId,
    uploadedFiles = []
) => {
    const {
        title,
        subtitle,
        description,
        type,
        listingType,
        location,
        possessionDate,
        configurations,
    } = propertyData;

    // Prepare media data from uploaded files
    const mediaData = uploadedFiles.map((file, index) => ({
        url: `/uploads/properties/${file.filename}`,
        type: 'IMAGE',
        isFeatured: index === 0,
        order: index,
    }));

    const property = await prisma.property.create({
        data: {
            title,
            subtitle,
            description,
            type,
            listingType,
            location,
            possessionDate,
            agentId,
            configurations: {
                create: configurations,
            },
            media:
                mediaData.length > 0
                    ? {
                          create: mediaData,
                      }
                    : undefined,
        },
        include: {
            configurations: true,
            media: true,
            agent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    businessName: true,
                },
            },
        },
    });

    logger.info({
        message: 'Property created successfully',
        propertyId: property.id,
        agentId,
        title: property.title,
        mediaCount: uploadedFiles.length,
    });

    return property;
};

export const updateProperty = async (
    propertyId,
    agentId,
    propertyData,
    uploadedFiles = []
) => {
    // First, verify property exists and agent owns it
    const existingProperty = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { media: true },
    });

    if (!existingProperty) {
        const error = new Error('Property not found');
        error.status = 404;
        throw error;
    }

    if (existingProperty.agentId !== agentId) {
        const error = new Error(
            'Unauthorized: You can only update your own properties'
        );
        error.status = 403;
        throw error;
    }

    const updateData = {};
    if (propertyData.title !== undefined) updateData.title = propertyData.title;
    if (propertyData.subtitle !== undefined)
        updateData.subtitle = propertyData.subtitle;
    if (propertyData.description !== undefined)
        updateData.description = propertyData.description;
    if (propertyData.type !== undefined) updateData.type = propertyData.type;
    if (propertyData.listingType !== undefined)
        updateData.listingType = propertyData.listingType;
    if (propertyData.location !== undefined)
        updateData.location = propertyData.location;
    if (propertyData.possessionDate !== undefined)
        updateData.possessionDate = propertyData.possessionDate;

    const updatedProperty = await prisma.$transaction(async (tx) => {
        const property = await tx.property.update({
            where: { id: propertyId },
            data: updateData,
        });

        if (propertyData.configurations !== undefined) {
            await tx.propertyConfiguration.deleteMany({
                where: { propertyId },
            });

            if (propertyData.configurations.length > 0) {
                await tx.propertyConfiguration.createMany({
                    data: propertyData.configurations.map((config) => ({
                        ...config,
                        propertyId,
                    })),
                });
            }
        }

        // Handle media: delete old and create new if files provided
        if (uploadedFiles.length > 0) {
            const oldMedia = await tx.propertyMedia.findMany({
                where: { propertyId },
            });

            await tx.propertyMedia.deleteMany({
                where: { propertyId },
            });

            oldMedia.forEach((media) => {
                const filePath = path.join(
                    process.cwd(),
                    media.url.startsWith('/') ? media.url.slice(1) : media.url
                );
                fs.unlink(filePath, (err) => {
                    if (err) {
                        logger.warn({
                            message: 'Failed to delete old media file',
                            filePath,
                            error: err.message,
                        });
                    }
                });
            });

            // Create new media records
            const mediaData = uploadedFiles.map((file, index) => ({
                url: `/uploads/properties/${file.filename}`,
                type: 'IMAGE',
                isFeatured: index === 0,
                order: index,
                propertyId,
            }));

            await tx.propertyMedia.createMany({
                data: mediaData,
            });
        }

        return property;
    });

    const propertyWithRelations = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            configurations: true,
            media: true,
            agent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    businessName: true,
                },
            },
        },
    });

    logger.info({
        message: 'Property updated successfully',
        propertyId,
        agentId,
        updatedFields: Object.keys(updateData),
        configurationsUpdated: propertyData.configurations !== undefined,
        mediaUpdated: uploadedFiles.length > 0,
    });

    return propertyWithRelations;
};

export const deleteProperty = async (propertyId, agentId) => {
    // Verify property exists and agent owns it
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { media: true },
    });

    if (!property) {
        const error = new Error('Property not found');
        error.status = 404;
        throw error;
    }

    if (property.agentId !== agentId) {
        const error = new Error(
            'Unauthorized: You can only delete your own properties'
        );
        error.status = 403;
        throw error;
    }

    await prisma.$transaction(async (tx) => {
        await tx.enquiry.deleteMany({
            where: { propertyId },
        });

        await tx.propertyConfiguration.deleteMany({
            where: { propertyId },
        });

        await tx.propertyMedia.deleteMany({
            where: { propertyId },
        });

        await tx.property.delete({
            where: { id: propertyId },
        });
    });

    // Delete media files from storage
    property.media.forEach((media) => {
        const filePath = path.join(
            process.cwd(),
            media.url.startsWith('/') ? media.url.slice(1) : media.url
        );
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.warn({
                    message:
                        'Failed to delete media file during property deletion',
                    filePath,
                    error: err.message,
                });
            }
        });
    });

    logger.info({
        message: 'Property deleted successfully',
        propertyId,
        agentId,
        title: property.title,
        mediaCount: property.media.length,
    });

    return {
        id: propertyId,
        message: 'Property and all related data deleted successfully',
    };
};
