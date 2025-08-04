# Global Configuration System

This directory contains the global configuration system that allows you to manage `data.json` and `users.json` from a central location.

## Files

- `database.json` - Main configuration file
- `config.js` - Configuration manager module
- `update-config.js` - Command-line script to update configuration
- `README.md` - This documentation

## Configuration Structure

The `database.json` file contains:

```json
{
  "files": {
    "cities": "data.json",
    "users": "users.json"
  },
  "paths": {
    "root": "./",
    "data": "./data.json",
    "users": "./users.json"
  },
  "defaults": {
    "maxCitiesPerUser": 10,
    "maxAttractionsPerCity": 5,
    "maxRestaurantsPerCity": 5
  }
}
```

## Usage

### 1. Show Current Configuration

```bash
cd backend/config
node update-config.js --show
```

### 2. Change Data Files

To use different data files (e.g., `data_example.json`):

```bash
cd backend/config
node update-config.js --cities-file data_example.json
```

### 3. Update Limits

To change the maximum number of cities per user:

```bash
cd backend/config
node update-config.js --max-cities 15
```

To change the maximum attractions per city:

```bash
cd backend/config
node update-config.js --max-attractions 10
```

To change the maximum restaurants per city:

```bash
cd backend/config
node update-config.js --max-restaurants 8
```

### 4. Multiple Updates

You can combine multiple updates:

```bash
cd backend/config
node update-config.js --cities-file data_example.json --max-cities 15 --max-attractions 10
```

## Benefits

1. **Centralized Management**: All database file paths are managed from one place
2. **Easy Updates**: Change file names or limits without modifying code
3. **Flexible Limits**: Adjust maximum cities, attractions, and restaurants per user/city
4. **Backward Compatibility**: Default configuration ensures the system works even if config files are missing

## Integration

The configuration system is automatically used by:

- `backend/src/city.js` - Uses configured data file and limits
- `backend/src/user.js` - Uses configured users file

## Example Workflows

### Switch to Example Data

```bash
# Copy your example data
cp data_example.json backend/data_example.json

# Update configuration to use the example data
cd backend/config
node update-config.js --cities-file data_example.json

# Restart your server
cd ..
npm run dev
```

### Increase Limits for Testing

```bash
cd backend/config
node update-config.js --max-cities 20 --max-attractions 10 --max-restaurants 10
```

### Reset to Defaults

```bash
cd backend/config
node update-config.js --cities-file data.json --max-cities 10 --max-attractions 5 --max-restaurants 5
``` 