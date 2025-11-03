# Database Seed Script

This document explains how to use the seed script to populate your HopeNet database with sample data.

## Prerequisites

1. **Supabase Account**: You need a Supabase project set up
2. **Environment Variables**: Configure your `.env.local` file with Supabase credentials
3. **Database Table**: Create the `missing_person_requests` table in your Supabase database

## Database Schema

Create the following tables in your Supabase SQL editor:

### Main Table

```sql
CREATE TABLE missing_person_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Person details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER,
  description TEXT,
  last_seen_location TEXT NOT NULL,
  last_seen_date TIMESTAMP WITH TIME ZONE,

  -- Location information
  parish TEXT NOT NULL,

  -- Contact information
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('missing', 'found', 'in_progress')),

  -- Additional info
  photo_url TEXT,
  notes TEXT,

  -- Email notification tracking
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_missing_person_requests_parish ON missing_person_requests(parish);
CREATE INDEX idx_missing_person_requests_status ON missing_person_requests(status);
CREATE INDEX idx_missing_person_requests_created_at ON missing_person_requests(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE missing_person_requests ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON missing_person_requests
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON missing_person_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Audit Logging Table

For tracking status changes, also run the SQL in `scripts/schema-updates.sql` to create the audit logging table and triggers. This enables:
- Tracking who changed status and when
- Automatic email notifications when status changes to "found"
- Full audit trail of all status changes

## Setup

1. Copy the environment example file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Create the database table using the SQL schema above in your Supabase SQL Editor

## Running the Seed Script

To populate your database with sample data:

```bash
npm run seed
```

This will:

- Generate 2-4 sample missing person requests for each of Jamaica's 14 parishes
- Create realistic sample data including names, locations, contact info, and status
- Insert all records into your Supabase database

### Sample Output

```
🌱 Starting database seed...

📊 Generated 42 sample requests across 14 parishes

Parish Distribution:
  Kingston             : 3 requests
  St. Andrew           : 4 requests
  St. Thomas           : 2 requests
  Portland             : 3 requests
  St. Mary             : 4 requests
  St. Ann              : 3 requests
  Trelawny             : 2 requests
  St. James            : 4 requests
  Hanover              : 2 requests
  Westmoreland         : 3 requests
  St. Elizabeth        : 3 requests
  Manchester           : 3 requests
  Clarendon            : 3 requests
  St. Catherine        : 3 requests

💾 Inserting data into Supabase...

✅ Successfully inserted 42 records

🎉 Seed completed successfully!
```

## Jamaican Parishes

The seed script creates data across all 14 Jamaican parishes:

### Surrey County

- Kingston
- St. Andrew
- St. Thomas
- Portland

### Middlesex County

- St. Mary
- St. Ann
- Trelawny
- St. James
- Manchester
- Clarendon
- St. Catherine

### Cornwall County

- Hanover
- Westmoreland
- St. Elizabeth

## Map Data

Geographic data for mapping is available in the following formats:

- **GeoJSON**: `/public/data/jamaica-parishes.geojson`
- **TopoJSON**: `/public/data/jamaica-parishes.topojson`

Both files contain polygon boundaries for all 14 parishes with properties including:

- Parish name
- County
- Capital city

## Parish Constants

Parish data is available as TypeScript constants in `/src/lib/constants/parishes.ts`:

```typescript
import { JAMAICAN_PARISHES, PARISH_METADATA } from '@/lib/constants/parishes';

// Array of all parish names
console.log(JAMAICAN_PARISHES); // ['Kingston', 'St. Andrew', ...]

// Get metadata for a specific parish
const kingston = PARISH_METADATA['Kingston'];
console.log(kingston.capital); // 'Kingston'
console.log(kingston.lat, kingston.lng); // 17.9714, -76.7931
```

## Troubleshooting

### "Missing Supabase environment variables" error

Make sure you have:

1. Created the `.env.local` file
2. Added valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values

### "Table does not exist" error

Create the `missing_person_requests` table using the SQL schema provided above.

### Permission errors

Check your Supabase Row Level Security (RLS) policies. The seed script needs permission to insert records.
