const fs = require('fs');
const path = require('path');

/**
 * Global Configuration Manager
 * 
 * Manages database file paths and application settings from a central location.
 * Allows easy updates to data.json and users.json file paths.
 */
class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, 'database.json');
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from database.json
   * @returns {Object} Configuration object
   */
  loadConfig() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Error loading config:', error.message);
      // Return default configuration if file doesn't exist
      return {
        files: {
          cities: "data.json",
          users: "users.json"
        },
        paths: {
          root: "./",
          data: "./data.json",
          users: "./users.json"
        },
        defaults: {
          maxCitiesPerUser: 10,
          maxAttractionsPerCity: 5,
          maxRestaurantsPerCity: 5
        }
      };
    }
  }

  /**
   * Get the path to the cities data file
   * @returns {string} Path to data.json
   */
  getCitiesFilePath() {
    return path.join(__dirname, '..', this.config.paths.data);
  }

  /**
   * Get the path to the users data file
   * @returns {string} Path to users.json
   */
  getUsersFilePath() {
    return path.join(__dirname, '..', this.config.paths.users);
  }

  /**
   * Get cities data file name
   * @returns {string} data.json filename
   */
  getCitiesFileName() {
    return this.config.files.cities;
  }

  /**
   * Get users data file name
   * @returns {string} users.json filename
   */
  getUsersFileName() {
    return this.config.files.users;
  }

  /**
   * Get maximum cities per user
   * @returns {number} Maximum cities limit
   */
  getMaxCitiesPerUser() {
    return this.config.defaults.maxCitiesPerUser;
  }

  /**
   * Get maximum attractions per city
   * @returns {number} Maximum attractions limit
   */
  getMaxAttractionsPerCity() {
    return this.config.defaults.maxAttractionsPerCity;
  }

  /**
   * Get maximum restaurants per city
   * @returns {number} Maximum restaurants limit
   */
  getMaxRestaurantsPerCity() {
    return this.config.defaults.maxRestaurantsPerCity;
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration object
   */
  updateConfig(newConfig) {
    try {
      // Deep merge the configuration
      this.config = this.deepMerge(this.config, newConfig);
      
      // Update paths when files change
      if (newConfig.files) {
        if (newConfig.files.cities) {
          this.config.paths.data = `./${newConfig.files.cities}`;
        }
        if (newConfig.files.users) {
          this.config.paths.users = `./${newConfig.files.users}`;
        }
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('Configuration updated successfully');
    } catch (error) {
      console.error('Error updating config:', error.message);
    }
  }

  /**
   * Deep merge objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /**
   * Get full configuration object
   * @returns {Object} Complete configuration
   */
  getConfig() {
    return this.config;
  }
}

// Create singleton instance
const configManager = new ConfigManager();

module.exports = configManager; 