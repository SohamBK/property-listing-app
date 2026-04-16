import logger from '../../../utils/logger.js';
import { errorResponse, successResponse } from '../../../utils/response.js';
import {
    loginUser,
    refreshAuthTokens,
    logoutUser,
    registerUser,
} from './auth.service.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await loginUser({
            email,
            password,
        });

        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: ACCESS_TOKEN_MAX_AGE,
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        return successResponse(res, { user }, 'Login successful');
    } catch (error) {
        logger.error({
            message: 'Login failed',
            error: error.message,
            route: '/api/v1/auth/login',
        });

        return errorResponse(
            res,
            error.message || 'Invalid credentials',
            error.status || 500
        );
    }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            const error = new Error('Refresh token required');
            error.status = 401;
            throw error;
        }

        const {
            accessToken,
            refreshToken: newRefreshToken,
            user,
        } = await refreshAuthTokens(refreshToken);

        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: ACCESS_TOKEN_MAX_AGE,
        });

        res.cookie('refreshToken', newRefreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        return successResponse(
            res,
            { user },
            'Tokens refreshed successfully'
        );
    } catch (error) {
        logger.error({
            message: 'Token refresh failed',
            error: error.message,
            route: '/api/v1/auth/refresh',
        });

        return errorResponse(
            res,
            error.message || 'Invalid refresh token',
            error.status || 500
        );
    }
};

export const register = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            role,
            businessName,
            address,
            location,
            expertise,
        } = req.body;

        const { user, accessToken, refreshToken } = await registerUser({
            name,
            email,
            phone,
            password,
            role,
            businessName,
            address,
            location,
            expertise,
        });

        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: ACCESS_TOKEN_MAX_AGE,
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        return successResponse(res, { user }, 'User registered successfully');
    } catch (error) {
        logger.error({
            message: 'Registration failed',
            error: error.message,
            route: '/api/v1/auth/register',
        });

        return errorResponse(
            res,
            error.message || 'Registration failed',
            error.status || 500
        );
    }
};

export const logout = async (req, res) => {
    try {
        await logoutUser();

        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);

        logger.info({
            message: 'User logged out',
            route: '/api/v1/auth/logout',
        });

        return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
        logger.error({
            message: 'Logout failed',
            error: error.message,
            route: '/api/v1/auth/logout',
        });

        return errorResponse(
            res,
            error.message || 'Logout failed',
            error.status || 500
        );
    }
};
