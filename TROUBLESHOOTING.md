# Supabase Troubleshooting Guide

Quick reference for common Supabase connection issues and solutions.

## Quick Diagnostics

### 1. Check Environment Variables
```bash
# Verify .env file exists and has correct format
cat .env

# Required variables:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key
# VITE_DEMO_MODE=false
```

### 2. Test Database Connection
**In Supabase SQL Editor:**
```sql
-- Test basic connection
SELECT current_user, now();

-- Test table access
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM bookings;
```

### 3. Check User Authentication
**In browser console:**
```javascript
// Check current session
console.log(await supabase.auth.getSession());

// Check user profile
console.log(await supabase.from('profiles').select('*').single());
```

## Common Issues

### "Permission denied for table" Error
**Cause:** Row Level Security (RLS) policies are blocking access
**Solution:**
1. Verify user role in `profiles` table
2. Check RLS policies for the affected table
3. Ensure policies allow access for your user's role

### "relation does not exist" Error  
**Cause:** Database table hasn't been created
**Solution:** Run `supabase/migration.sql` in Supabase SQL editor

### "Invalid JWT" Error
**Cause:** Authentication token expired or invalid
**Solution:**
1. Clear browser storage: `localStorage.clear()`
2. Re-login to the application
3. Check if anon key is correct in `.env`

### Connection Timeout
**Cause:** Network issues or slow database response
**Solution:**
1. Check internet connection
2. Verify Supabase project status
3. Try accessing Supabase dashboard directly

### "User not found" on Login
**Cause:** User hasn't been created in Supabase Auth
**Solution:**
```bash
# Create demo user (requires service role key)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-demo-user.mjs
```

## RLS Policy Examples

```sql
-- Allow admins full access to all tables
CREATE POLICY "Admin access" ON bookings
    FOR ALL TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- Allow users to see only their own data
CREATE POLICY "User access" ON bookings  
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'dispatcher')
    );
```

## Performance Tips

- Use `select('column1,column2')` instead of `select('*')`
- Add `limit(n)` for large datasets
- Create database indexes for frequently queried columns
- Use batch operations instead of loops

## Getting Help

1. Check [Supabase Documentation](https://supabase.com/docs)
2. Test queries in Supabase SQL editor
3. Check browser developer console for detailed errors
4. Verify project status in Supabase dashboard