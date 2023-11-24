const fs = require('fs');

// Copy the staging config to the main Shopify config
fs.copyFileSync('./shopify.app.staging.toml', './shopify.app.toml');

console.log("Staging configuration applied.");
