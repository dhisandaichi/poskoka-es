# Supabase Backend Integration Guide

Your React frontend is ready. Now let's connect it to the **Supabase** backend (Database + Auth).

## 1. Create a Supabase Project (0 Rupiah)
1. Go to [database.new](https://database.new) and sign in with GitHub.
2. Create a new project:
   - **Name**: `poskoka-es`
   - **Database Password**: (Save this securely!)
   - **Region**: Singapore (SG) is best for Indonesia users.
   - **Pricing Plan**: Free Tier ($0/month).

## 2. Get API Credentials
Once the project is created:
1. Go to **Project Settings > API**.
2. Copy the **Project URL** (`https://xyz.supabase.co`).
3. Copy the **anon / public** Key (`eyJh...`).

## 3. Set Environment Variables
Create a `.env` file in the root of your project (`d:\poskoka-es\.env`) and paste your credentials:

```bash
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note**: Do strict NOT commit `.env` to public repositories if you share code publicly.

## 4. Run Database Migration (SQL)
1. Open your Supabase Dashboard.
2. Go to the **SQL Editor** (icon on the left sidebar).
3. Click **New Query**.
4. Open the file `supabase_schema.sql` from your project folder.
5. Copy-paste all the contents into the SQL Editor.
6. Click **Run** (bottom right).
   - This will create all your tables (`volunteers`, `schedules`, `attendance`, etc.) and set up security rules.

## 5. Enable Authentication (Optional but Recommended)
1. Go to **Authentication > Providers**.
2. Enable **Email/Password** sign-in.
3. Disable "Confirm Email" if you want users to log in immediately without verifying email (good for internal apps).

## 6. Update Application Code to Use Real Data
Currently, the app uses `staticData.js`. To switch to real data:

1. Import the helper functions from `src/lib/supabaseClient.js` in your components.
2. Replace static data imports with `useEffect` calls to fetch data.

**Example (VolunteerDashboard.jsx):**

```javascript
import { useEffect, useState } from 'react';
import { getVolunteers, getAttendance } from '../lib/supabaseClient';

export default function VolunteerDashboard() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getVolunteers();
                setVolunteers(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    // ... rest of your component
}
```

## 7. Deploy Updates
After setting up Supabase and testing locally:
```bash
npm run build
firebase deploy
```
