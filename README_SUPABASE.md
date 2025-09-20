# Supabase Migration (Demo Ready)

This repo is your **original app** with Supabase wiring added — no stripped features.

## 1) Environment

Create `.env` in project root (Vite):
```
VITE_SUPABASE_URL=https://hepfwlezvvfdbkoqujhh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlcGZ3bGV6dnZmZGJrb3F1amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzIxMjksImV4cCI6MjA3MzUwODEyOX0.LLUWo73JzL272jEIfKjY1GG9CyQapzE61-RXIoOLXc4
VITE_SUPABASE_EDGE_FUNCTION_URL=https://hepfwlezvvfdbkoqujhh.supabase.co/functions/v1
```

## 2) Database schema

Open **Supabase SQL** and run:
- `supabase/migration.sql`

This adds missing columns, relationships, policies, and creates the **vehicle_configurator** table with sample fleet.

## 3) Demo admin user

Creating users with a password cannot be done in pure SQL. Use the **service role** once (keep it secret!):

```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-demo-user.mjs
```
Defaults:
- Email: `admin@example.com`
- Password: `Password123!`

This also works from your CI, then you can rotate the service key.

## 4) Auth gate

We added `src/components/AuthGate.jsx`. Wrap your app in it so unauthenticated users see login:

```jsx
import AuthGate from './components/AuthGate';

export default function Root() {
  return (
    <AuthGate>
      <App /> {/* your original app */}
    </AuthGate>
  );
}
```

Alternatively, inside your existing `App.jsx`, use your own login page and add:
```js
const [session, setSession] = useState(null);
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  return () => sub.subscription.unsubscribe();
}, []);
if (!session) return <LoginSupabase />;
```

## 5) Fleet + Configurator

- API files:
  - `src/api/vehicles.supabase.js`
  - `src/api/configurator.supabase.js`
- Fleet page should call these when listing vehicles or opening the configurator modal.

## 6) Run

```
npm install
npm run dev
```

Login with the demo user you created in step 3.

## 7) Data Storage Migration

This app has been fully migrated from localStorage/sessionStorage to Supabase as the primary data store:

### Production Mode (Default)
- Set `VITE_DEMO_MODE=false` in `.env` (or omit the variable)
- All data (bookings, customers, drivers, etc.) is stored in and loaded from Supabase
- Settings, notifications, and activity history are persisted in Supabase tables
- No localStorage usage except for UI state (sidebar collapse)

### Demo Mode
- Set `VITE_DEMO_MODE=true` in `.env` to enable demo mode
- Uses localStorage/sessionStorage for data persistence
- Suitable for testing, demos, or offline scenarios
- No Supabase authentication required

### API Integration
The app uses dedicated API modules in `src/api/` that automatically handle:
- Production mode: Direct Supabase queries
- Demo mode: localStorage/sessionStorage fallback
- Consistent data models between both modes

### Migration Status
- ✅ Settings persistence: Migrated to `user_settings` table
- ✅ Notifications: Migrated to `notifications` table  
- ✅ Activity history: Migrated to `activity_history` table
- ✅ All entity CRUD operations: Use Supabase APIs
- ✅ Demo mode: Explicit environment control
- ✅ UI state: Sidebar collapse preserved in localStorage (acceptable UI state)
- ⏳ AppStore context: Partially migrated (data loading logic needs completion)

### Data Integration Helper
Use `src/utils/dataIntegration.js` for unified data access across the app:

```javascript
import dataIntegration from '../utils/dataIntegration';

// Works in both demo and production modes
const bookings = await dataIntegration.getBookings();
const result = await dataIntegration.addBooking(bookingData);
```

All APIs automatically detect the current mode and route to appropriate storage.

