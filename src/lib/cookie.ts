// lib/cookie.js

// Function to set a cookie
export const setCookie = (name, value, days) => {
    const expires = days
        ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
        : '';
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
};

// Function to get a cookie
export const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};

// Function to delete a cookie
export const deleteCookie = (name) => {
    setCookie(name, '', -1);
};
