#!/usr/bin/env node

/**
 * Configuration Update Script
 * 
 * Allows updating the global configuration from the command line.
 * Usage: node update-config.js [option] [value]
 */

const config = require('./config');

function showUsage() {
  console.log(`
Configuration Update Script

Usage: node update-config.js [option] [value]

Options:
  --cities-file <filename>     Set the cities data file name (e.g., data.json)
  --users-file <filename>      Set the users data file name (e.g., users.json)
  --max-cities <number>        Set maximum cities per user (default: 10)
  --max-attractions <number>   Set maximum attractions per city (default: 5)
  --max-restaurants <number>   Set maximum restaurants per city (default: 5)
  --show                       Show current configuration
  --help                       Show this help message

Examples:
  node update-config.js --cities-file data_example.json
  node update-config.js --max-cities 15
  node update-config.js --show
  `);
}

function updateConfig() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    return;
  }
  
  if (args.includes('--show')) {
    console.log('Current Configuration:');
    console.log(JSON.stringify(config.getConfig(), null, 2));
    return;
  }
  
  let updates = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const option = args[i];
    const value = args[i + 1];
    
    if (!value) {
      console.error(`Error: Missing value for option ${option}`);
      process.exit(1);
    }
    
    switch (option) {
      case '--cities-file':
        updates.files = { ...updates.files, cities: value };
        break;
      case '--users-file':
        updates.files = { ...updates.files, users: value };
        break;
      case '--max-cities':
        const maxCities = parseInt(value);
        if (isNaN(maxCities) || maxCities < 1) {
          console.error('Error: max-cities must be a positive number');
          process.exit(1);
        }
        updates.defaults = { ...updates.defaults, maxCitiesPerUser: maxCities };
        break;
      case '--max-attractions':
        const maxAttractions = parseInt(value);
        if (isNaN(maxAttractions) || maxAttractions < 1) {
          console.error('Error: max-attractions must be a positive number');
          process.exit(1);
        }
        updates.defaults = { ...updates.defaults, maxAttractionsPerCity: maxAttractions };
        break;
      case '--max-restaurants':
        const maxRestaurants = parseInt(value);
        if (isNaN(maxRestaurants) || maxRestaurants < 1) {
          console.error('Error: max-restaurants must be a positive number');
          process.exit(1);
        }
        updates.defaults = { ...updates.defaults, maxRestaurantsPerCity: maxRestaurants };
        break;
      default:
        console.error(`Error: Unknown option ${option}`);
        showUsage();
        process.exit(1);
    }
  }
  
  if (Object.keys(updates).length > 0) {
    config.updateConfig(updates);
    console.log('Configuration updated successfully!');
    console.log('New configuration:');
    console.log(JSON.stringify(config.getConfig(), null, 2));
  }
}

// Run the script
updateConfig(); 