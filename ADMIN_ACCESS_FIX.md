# Admin Access Fix - September 25, 2025

## Problem
When users logged in, they were no longer getting admin access and had full system access removed. Users were being assigned the "User" role instead of "Admin" role upon login.

## Root Cause
The issue was in the `setupUserProfile` function in `src/context/AppStore.jsx`. The function was:
1. Defaulting new users to "User" role instead of "Admin"
2. Overriding existing profile roles with "User" if no role was set
3. Explicitly creating profiles with `role: "User"` instead of using the database default

## Solution Applied

### 1. Fixed AppStore.jsx User Profile Setup
- Changed default role from `"User"` to `"Admin"`
- Updated profile role fallback from `|| "User"` to `|| "Admin"`
- Removed explicit role assignment in profile creation to use database default
- Updated error fallback to assign "Admin" role

### 2. Fixed Signup Default Role
- Changed signup form default role from `"User"` to `"Admin"`

### 3. Database Schema Verification
- Confirmed that `supabase/migration.sql` correctly sets `role text default 'admin'`
- Database defaults to admin role for new profiles

## Files Modified

### src/context/AppStore.jsx
```jsx
// Before
let role = "User";
role = profile.role || "User";
{ id: user.id, full_name: user.email, role: "User" }

// After  
let role = "Admin";
role = profile.role || "Admin";
{ id: user.id, full_name: user.email } // Uses database default
```

### src/pages/Signup.jsx
```jsx
// Before
const [role, setRole] = useState("User");

// After
const [role, setRole] = useState("Admin");
```

## Verification
Run `node test-admin-fix.mjs` to verify all fixes are applied correctly.

## For Existing Users
If you have existing users with "User" roles in your database, run:
```bash
node scripts/update-user-roles.mjs
```

This will update all existing non-admin users to have "Admin" role.

## Result
✅ All logged-in users now get admin access by default
✅ Full system access is restored for authenticated users
✅ Admin functions and navigation are available
✅ Compatible with existing admin utility functions
