# Priority Transfers Admin Enterprise

A modern React-based admin panel for ride bookings, drivers, fleet, invoices, and more with automatic driver email notifications.

## Features

- Role-based access (Admin, Dispatcher, Viewer)
- Bookings calendar & list views
- Customer, driver, fleet management
- Invoices & billing
- KPI dashboard with charts
- **Automatic driver email notifications** ✨
- **Scheduled pickup reminders** ✨
- Notifications
- Offline-ready (localStorage)
- Easy-to-extend architecture

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Email Settings (for driver notifications)
Copy the environment configuration file:
```bash
cp .env.example .env
```

Edit `.env` and configure your email settings:
```env
# Gmail configuration (recommended)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_specific_password

# Reminder timing (hours before pickup)
REMINDER_HOURS_BEFORE_PICKUP=1

# Server port
PORT=3001
```

**Note:** For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password (not your regular password)
3. Use the App Password in the `EMAIL_PASS` field

### 3. Run the application

#### Development Mode (Frontend + Backend)
```bash
npm run dev:full
```
This runs both the React frontend (port 5173) and Express backend (port 3001) simultaneously.

#### Run Frontend Only
```bash
npm run dev
```
Then open [http://localhost:5173/priority-transfers-admin/](http://localhost:5173/priority-transfers-admin/) in your browser.

#### Run Backend Only
```bash
npm run server
```
Server will be available at http://localhost:3001

### 4. Build for production
```bash
npm run build
```

## Email Notification System

The application now includes an automatic email notification system for drivers:

### When Bookings are Confirmed
1. **Immediate confirmation email** - Sent to the assigned driver when booking status changes to "confirmed"
2. **Automatic reminder scheduling** - A pickup reminder is scheduled to be sent 1 hour before pickup time (configurable)

### API Endpoints
- `POST /api/confirm-booking` - Confirms booking and schedules reminder
- `POST /api/notify-driver` - Sends immediate notification
- `GET /api/scheduled-reminders` - Lists all scheduled reminders
- `DELETE /api/cancel-reminder/:bookingId` - Cancels a scheduled reminder
- `POST /api/test-email` - Tests email configuration
- `GET /api/health` - Server health check

### Features
- ✅ Automatic confirmation emails when bookings are confirmed
- ✅ Scheduled reminder emails before pickup time
- ✅ Configurable reminder timing
- ✅ Email template customization
- ✅ Error handling and logging
- ✅ In-memory scheduling (suitable for single-server deployments)

## Deploying

### GitHub Pages

This application is configured for GitHub Pages deployment using the `/docs` folder approach with hash-based routing for compatibility. To deploy:

1. **Build the project**:
   ```bash
   npm run build
   ```
   This generates optimized assets in the `docs/` folder with the correct base path `/priority-transfers-admin/`.

2. **Commit the built assets**:
   ```bash
   git add .
   git commit -m "Update build assets"
   git push origin main
   ```
   **Important**: The assets in `docs/assets/` must be committed to the repository for GitHub Pages to serve them correctly.

3. **Configure GitHub Pages**:
   - Navigate to your repository settings on GitHub
   - Select "Pages" from the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/docs" folder
   - Click "Save"

4. **Access your application**:
   - Your application will be available at: `https://[username].github.io/[repository-name]/`
   - Example: `https://aloc23.github.io/priority-transfers-admin/`

**Note**: This application uses HashRouter for GitHub Pages compatibility. URLs will include a hash symbol (e.g., `/#/dashboard`).

### Other Platforms

You can also deploy on [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) for enhanced routing support without hash symbols.

## License

MIT