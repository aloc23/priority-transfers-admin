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
cp .env.template .env
```
Edit `.env` with your Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key  
- `VITE_DEMO_MODE`: Set to `false` for production

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

## Supabase Troubleshooting & Best Practices

If you're experiencing persistent connection errors or other issues with Supabase, follow these troubleshooting steps:

### Quick Start Checklist

If the app fails to load or shows connection errors, check these items first:

1. **✅ Check .env file exists and has correct format**
   ```bash
   cat .env
   # Should show:
   # VITE_SUPABASE_URL=https://your-project.supabase.co
   # VITE_SUPABASE_ANON_KEY=your_anon_key
   # VITE_DEMO_MODE=false
   ```

2. **✅ Verify Supabase project is active**
   - Open your [Supabase Dashboard](https://supabase.com/dashboard)
   - Ensure your project status is "Active" (not paused/inactive)

3. **✅ Test basic connection**
   - Open browser developer console
   - Look for connection errors or configuration warnings
   - The app will show specific error messages if configuration is invalid

4. **✅ Try demo mode as fallback**
   - Set `VITE_DEMO_MODE=true` in your .env file
   - Restart the app to verify it works without Supabase

### Connection Error Solutions

| Error Type | Symptoms | Solution |
|------------|----------|----------|
| **Configuration Issues** | "Missing environment variables" in console | Update .env with correct Supabase URL and key |
| **Network Timeout** | App hangs on loading screen | Check internet connection, try demo mode |
| **Invalid Credentials** | "Invalid JWT" or auth errors | Verify anon key in Supabase dashboard Settings → API |
| **Database Not Found** | "Table does not exist" errors | Run migration.sql in Supabase SQL editor |
| **Permission Denied** | "RLS policy" or "permission denied" | Check RLS policies allow access for your user role |

### 1. Verify Database Schema

**Check if all required tables exist in your Supabase dashboard:**
- `customers` - Customer management
- `drivers` - Driver information 
- `vehicles` - Fleet management
- `bookings` - Core business transactions
- `invoices` - Billing and payments
- `profiles` - User profiles and roles
- `activity_history` - Audit trail
- `partners` - Partner/vendor information

**Run the migration:** Open your Supabase SQL editor and execute `supabase/migration.sql` to create all necessary tables and relationships.

### 2. Configure Row Level Security (RLS) Policies

**Critical:** Ensure RLS policies are properly configured for each table. The migration script includes basic policies, but you may need to customize them:

```sql
-- Example: Allow admin users full access to bookings
CREATE POLICY "Admin full access" ON bookings
    FOR ALL TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );
```

**Test policies directly in Supabase:** Before deploying, use the Supabase dashboard to test queries and ensure your RLS policies work as expected.

### 3. Environment Configuration

**Step-by-step setup:**

1. **Create .env file** (if it doesn't exist):
   ```bash
   # Copy the template
   cp .env.template .env
   # OR create manually:
   touch .env
   ```

2. **Add required variables** to your .env file:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_DEMO_MODE=false
   ```

3. **Find your credentials**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to Settings → API
   - Copy "Project URL" for `VITE_SUPABASE_URL`
   - Copy "Project API keys" → "anon public" for `VITE_SUPABASE_ANON_KEY`

4. **Restart the development server**:
   ```bash
   npm run dev
   ```

**⚠️ Common mistakes:**
- URL should end with `.supabase.co` (not include `/rest/v1/`)
- Use the "anon" key, not the "service_role" key
- Keys are case-sensitive - copy exactly from dashboard
- No quotes around values in .env file

**✅ Validation:**
The app will automatically validate your configuration on startup and show detailed error messages if something is wrong.

### 4. Test Database Connection

**Quick connection test:**
```bash
# Create a demo user (requires service role key - keep secure!)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-demo-user.mjs
```

**Manual testing in Supabase:**
1. Go to your Supabase dashboard
2. Use the SQL editor to run: `SELECT * FROM profiles LIMIT 5;`
3. If this fails, check your RLS policies
4. Verify user authentication in the Auth section

### 5. Common Connection Issues & Solutions

**Issue: "Permission denied" or RLS errors**
- **Solution:** Check that your RLS policies allow access for your user role
- **Test:** Verify user roles in the `profiles` table match your app expectations

**Issue: "Network error" or timeouts**
- **Solution:** Check your network connection and Supabase project status
- **Test:** Try accessing your Supabase dashboard directly

**Issue: "Invalid JWT" or authentication errors**  
- **Solution:** Clear browser localStorage/sessionStorage and re-login
- **Check:** Verify your anon key hasn't expired or changed

**Issue: "Table does not exist" errors**
- **Solution:** Run the migration script in your Supabase SQL editor
- **Verify:** Check the Tables section in your Supabase dashboard

### 6. Error Handling Best Practices

**The app includes robust error handling, but consider these enhancements:**

```javascript
// Example: Enhanced error handling in API calls
try {
  const { data, error } = await supabase
    .from('bookings')
    .select('*');
    
  if (error) {
    console.error('Supabase Error:', error.message);
    // Show user-friendly message
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data;
} catch (error) {
  // Handle network errors, timeouts, etc.
  console.error('Connection Error:', error);
  throw error;
}
```

### 7. Performance Optimization

**Database queries:**
- Use `select()` to limit returned columns
- Add proper indexes for frequently queried fields
- Use `limit()` for large datasets
- Consider pagination for tables with many rows

**Batch operations:**
```javascript
// Good: Batch insert
const { data, error } = await supabase
  .from('bookings')
  .insert(multipleBookings);

// Avoid: Multiple single inserts in a loop
```

### 8. Monitoring & Debugging

**Enable logging in development:**
```javascript
// The app includes a logger utility at src/utils/logger.js
import { logger } from '../utils/logger';

logger.info('User action', { userId, action: 'create_booking' });
logger.error('Database error', { error: error.message, table: 'bookings' });
```

**Monitor in production:**
- Use Supabase's built-in monitoring dashboard
- Set up alerts for high error rates or slow queries
- Monitor API usage to avoid rate limits

### 9. Security Checklist

- [ ] All tables have appropriate RLS policies enabled
- [ ] User roles are properly configured in the `profiles` table  
- [ ] Service role keys are kept secure (not in client code)
- [ ] Environment variables are not committed to the repository
- [ ] API keys are rotated periodically
- [ ] Database backups are configured in Supabase

### 10. Getting Help

If issues persist:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review error logs in your browser's developer console
3. Test queries directly in the Supabase SQL editor
4. Verify your project's API status in the Supabase dashboard
5. Consider reaching out to [Supabase Support](https://supabase.com/support)

## License

MIT