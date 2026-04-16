import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error(
        'JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables'
    );
}

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m',
    });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};
