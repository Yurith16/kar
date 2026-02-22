# Karbot - WhatsApp Bot

## Overview
A WhatsApp bot built with Node.js using the Baileys library for WhatsApp Web API integration. The bot supports plugins, custom commands, and various utilities.

## Recent Changes
- 2026-02-22: Imported project to Replit environment
- 2026-02-22: Upgraded from Node.js 18 to Node.js 20 (required by @whiskeysockets/baileys)
- 2026-02-22: Fixed keepalive.js ES module import to CommonJS require
- 2026-02-22: Installed system dependencies (ffmpeg, imagemagick)

## Project Architecture
- **Runtime**: Node.js 20 (CommonJS)
- **Entry Point**: `index.js`
- **WhatsApp Library**: `@whiskeysockets/baileys` (via dgxeon-soket fork)
- **Config**: `config.js`
- **Database**: JSON-based (`database.json`, `database/` directory)
- **Plugins**: `plugins/` directory with various command modules
- **Library**: `lib/` directory with core utilities
- **Keep-alive**: `keepalive.js` - Express server for health checks
- **System deps**: ffmpeg, imagemagick

## Key Files
- `index.js` - Main bot entry, WhatsApp connection logic
- `handler.js` - Message/event handler
- `config.js` - Bot configuration (prefix, owner, etc.)
- `lib/simple.js` - WhatsApp socket wrapper
- `lib/db.js` - Database management
- `plugins/` - Bot command plugins

## User Preferences
- (none recorded yet)
