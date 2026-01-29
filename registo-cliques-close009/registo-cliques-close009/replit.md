# Registo de Cliques - Click Registration System

## Overview

A simple web application for registering button clicks across four government service categories (Cartório, Finanças, Segurança Social, Conservatória). Each click records the button pressed, a sequential daily number that resets each day, the date, and the time. The system is designed for citizen service centers ("Lojas do Cidadão") to track service interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates served by Flask
- **Pages**: 
  - `index.html` - Main fullscreen interface with 4 service buttons
  - `dashboard.html` - Analytics page with data table and export functionality
- **Styling**: Custom CSS with CSS variables for theming (dark theme with cyan/teal accents)
- **JavaScript**: Vanilla JS with async/await for API calls, no framework dependencies

### Backend Architecture
- **Framework**: Flask (Python 3.10+)
- **Pattern**: Simple MVC-like structure with Flask routes serving as controllers
- **API Endpoints**:
  - `GET /` - Serves main page
  - `POST /api/click` - Records a click with JSON body `{ "button": "service_name" }`
  - `GET /api/all` - Returns all click data with statistics
  - `GET /api/export` - Downloads data as CSV
  - `GET /api/health` - Health check endpoint

### Data Storage
- **Database**: SQLite (`clicks.db`)
- **Schema**: Single `clicks` table with columns:
  - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  - `button_label` (TEXT) - Service name
  - `click_number` (INTEGER) - Sequential number per day
  - `click_date` (TEXT) - Format YYYY-MM-DD
  - `click_time` (TEXT) - Format HH:MM
- **Initialization**: Database and table created automatically on first run via `init_db()`

### Key Design Decisions
1. **SQLite over external databases**: Chosen for simplicity and zero-configuration deployment. The application has low traffic requirements and benefits from file-based storage.
2. **Daily sequential numbering**: The `next_click_number()` function queries MAX(click_number) for the current date, enabling automatic daily reset without cron jobs.
3. **Fullscreen UI**: The main interface is designed for kiosk/tablet use with large touch targets.

## External Dependencies

### Python Packages
- **Flask >= 3.0.0**: Web framework for routing, templating, and API handling

### Frontend Resources
- **Google Fonts**: Space Grotesk font loaded from fonts.googleapis.com

### No External Services Required
- No authentication system
- No third-party APIs
- No external database connections
- Self-contained SQLite storage