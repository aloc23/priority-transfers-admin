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

### 2. Configure environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

Get these from: https://supabase.com/dashboard/project/[your-project]/settings/api

### 3. Run the app locally
```bash
npm run dev
```
Then open [http://localhost:5173/priority-transfers-admin/](http://localhost:5173/priority-transfers-admin/) in your browser.

### 4. Build for production
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