const { v4: uuidv4 } = require('uuid');

export function generateUniqueId(initialId:string = "db_") {
    const uniquePart = uuidv4().split('-').join('').slice(0, 10); // Ambil 10 karakter dari UUID
    return `${initialId}_${uniquePart}`;
}

