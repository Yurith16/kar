# Itsuki-Nakano WhatsApp Bot V3

## Overview
This is a WhatsApp multi-device bot built with Node.js using the Baileys library. It's a feature-rich bot with over 137 plugins for various functionalities including games, downloads, utilities, stickers, and more.

## Project Structure
- `index.js` - Main entry point, handles bot initialization and WhatsApp connection
- `handler.js` - Message handler for processing incoming messages
- `config.js` - Bot configuration (prefixes, owner info, API keys, etc.)
- `lib/` - Core libraries including database, serialization, and utilities
- `plugins/` - Bot command plugins organized by category
- `src/` - Additional source files and databases
- `database/` - JSON database files
- `Sessions/` - WhatsApp session credentials (gitignored)

## Running the Bot
The bot runs as a console application. When started:
1. It will prompt for connection method (QR code or pairing code)
2. Scan QR or enter pairing code in WhatsApp > Linked Devices
3. Once connected, the bot responds to commands with configured prefixes (., !, /, #, %)

## Key Dependencies
- `@whiskeysockets/baileys` - WhatsApp Web API
- `sharp` - Image processing
- `ffmpeg` - Media processing (system dependency)
- `imagemagick` - Image manipulation (system dependency)
- `wa-sticker-formatter` - Sticker creation

## Configuration
Edit `config.js` to customize:
- `global.owner` - Bot owner numbers
- `global.prefix` - Command prefixes
- `global.botNumber` - Bot's WhatsApp number
- Various API endpoints and keys

## Recent Changes
- 2026-01-13: Initial Replit setup
  - Installed Node.js 20 runtime
  - Added ffmpeg and imagemagick system dependencies
  - Configured console workflow for bot execution
  - Fixed sharp module compatibility issues
