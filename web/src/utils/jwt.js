import { jwtDecode } from 'jwt-decode';

export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  return Date.now() >= decoded.exp * 1000;
}