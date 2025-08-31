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

This app is configured for GitHub Pages deployment with hash-based routing. To deploy:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   - Push your changes to the main branch
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access your app**:
   - Your app will be available at: `https://[username].github.io/[repository-name]/`
   - Example: `https://aloc23.github.io/priority-transfers-admin/`

**Note**: This app uses HashRouter for GitHub Pages compatibility, so URLs will include a `#` symbol (e.g., `/#/dashboard`).

### Other Platforms

You can also host on [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) for better routing support without hash symbols.

## License

MIT