const fs = require('fs');
const sql = fs.readFileSync('u882012653_firatoto.sql', 'utf8');
const categories = [];
const brands = [];
const models = [];

const parseInsert = (tableName, sql) => {
    const regex = new RegExp(`INSERT INTO \\\`${tableName}\\\`.*?VALUES\\s*([\\s\\S]*?);`, 'g');
    let match;
    const valuesStrList = [];
    while ((match = regex.exec(sql)) !== null) {
        valuesStrList.push(match[1]);
    }
    return valuesStrList;
};

// productbrands (id, name)
const brandMatches = parseInsert('productbrands', sql);
brandMatches.forEach(valStr => {
    const regex = /\((\d+),\s*'([^']*)'\)/g;
    let m;
    while ((m = regex.exec(valStr)) !== null) {
        brands.push({ id: parseInt(m[1]), name: m[2] });
    }
});

// categories (id, name)
const catMatches = parseInsert('categories', sql);
catMatches.forEach(valStr => {
    const regex = /\((\d+),\s*'([^']*)'\)/g;
    let m;
    while ((m = regex.exec(valStr)) !== null) {
        categories.push({ id: parseInt(m[1]), name: m[2] });
    }
});

// brand_models (id, brand, model, image_url, display_order)
const modelMatches = parseInsert('brand_models', sql);
modelMatches.forEach(valStr => {
    const regex = /\((\d+),\s*'([^']*)',\s*'([^']*)',\s*(NULL|'[^']*'),\s*(\d+)\)/g;
    let m;
    while ((m = regex.exec(valStr)) !== null) {
        models.push({
            id: parseInt(m[1]),
            brand: m[2],
            model: m[3],
            image_url: m[4] === 'NULL' ? null : m[4].replace(/^'|'$/g, ''),
            display_order: parseInt(m[5])
        });
    }
});

let mockData = { categories: [], productbrands: [], models: [] };
try {
    if (fs.existsSync('mockData.json')) {
        mockData = JSON.parse(fs.readFileSync('mockData.json', 'utf8'));
    }
} catch(e) {}

mockData.categories = categories;
mockData.productbrands = brands;
mockData.models = models;

fs.writeFileSync('mockData.json', JSON.stringify(mockData, null, 2));
console.log("Brands found: " + brands.length);
console.log("Categories found: " + categories.length);
console.log("Models found: " + models.length);
