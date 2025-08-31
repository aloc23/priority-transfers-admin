# Priority Transfers Admin Enterprise

A modern React-based admin panel for ride bookings, drivers, fleet, invoices, and more.

## Features

- Role-based access (Admin, Dispatcher, Viewer)
- Bookings calendar & list views
- Customer, driver, fleet management
- Invoices & billing
- KPI dashboard with charts
- Notifications
- Offline-ready (localStorage)
- Easy-to-extend architecture

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the app locally
```bash
npm run dev
```
Then open [http://localhost:5173/priority-transfers-admin/](http://localhost:5173/priority-transfers-admin/) in your browser.

### 3. Build for production
```bash
npm run build
```

## Deploying

### GitHub Pages

This application is configured for GitHub Pages deployment using the `/docs` folder approach with hash-based routing for compatibility. To deploy:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Configure GitHub Pages**:
   - Push your changes to the main branch
   - Navigate to your repository settings on GitHub
   - Select "Pages" from the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/docs" folder
   - Click "Save"

3. **Access your application**:
   - Your application will be available at: `https://[username].github.io/[repository-name]/`
   - Example: `https://aloc23.github.io/priority-transfers-admin/`

**Note**: This application uses HashRouter for GitHub Pages compatibility. URLs will include a hash symbol (e.g., `/#/dashboard`).

### Other Platforms

You can also deploy on [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) for enhanced routing support without hash symbols.

## License

MIT