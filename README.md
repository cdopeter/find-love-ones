# HopeNet

HopeNet — a community-powered platform that helps families and organizations locate missing loved ones after natural disasters. When storms disrupt electricity, cell, and internet services, HopeNet provides a resilient communication channel for submitting search requests and sharing verified updates from trusted response teams.

> **📸 Screenshots**: See actual screenshots in the [docs/screenshots](./docs/screenshots/) directory once available.

![HopeNet Screenshot](./docs/screenshots/homepage.png)
_Screenshot: HopeNet homepage showing the main interface_

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Database Management](#database-management)
  - [Database Schema](#database-schema)
  - [Migrations](#migrations)
  - [Seeding Data](#seeding-data)
- [Deployment](#deployment)
  - [Edge Functions](#edge-functions)
  - [Production Deployment](#production-deployment)
- [Security & Privacy](#security--privacy)
  - [Role Management](#role-management)
  - [Privacy Notes](#privacy-notes)
  - [Row Level Security](#row-level-security)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Jamaican Parishes Data](#jamaican-parishes-data)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- ✅ **Search & Submit**: Search for missing loved ones and submit new requests
- ✅ **Interactive Dashboard**: Responder dashboard with map view and data tables
- ✅ **Parish-Based Organization**: Data organized by Jamaica's 14 parishes
- ✅ **Real-time Updates**: Status updates (missing, in progress, found)
- ✅ **CSV Export**: Export data for offline analysis
- ✅ **Modern UI**: Material UI components with dark/light mode toggle
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Supabase Backend**: Scalable PostgreSQL database with Row Level Security

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material UI (MUI)** - React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Emotion** - CSS-in-JS library (used by MUI)
- **Supabase** - Backend as a Service (PostgreSQL, Authentication, Storage)
- **React Leaflet** - Interactive maps for visualizing missing persons by location
- **React Hook Form + Zod** - Form handling and validation
- **TanStack Table** - Powerful table component for data display
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Features

- ✅ Modern Next.js App Router architecture
- ✅ TypeScript for type safety
- ✅ Material UI components with custom theme
- ✅ Tailwind CSS for utility styling
- ✅ Dark/Light mode toggle
- ✅ Responsive navigation (mobile & desktop)
- ✅ Clean layout with header and footer
- ✅ ESLint and Prettier configured
- ✅ Supabase client setup (requires configuration)
- ✅ **Email notifications when person is found**
- ✅ **Audit logging for status changes (who/when)**
- ✅ **Professional email templates**
- ✅ **Multiple email provider support (Resend, SendGrid, Test mode)**

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (comes with Node.js)
- A **Supabase account** (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/cdopeter/find-love-ones.git
cd find-love-ones
```

2. **Install dependencies:**

```bash
npm install
```

This will install all required packages including Next.js, React, Material UI, Supabase client, and development tools.

### Environment Variables

1. **Copy the example environment file:**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials and email settings:

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (optional, defaults to test mode)
EMAIL_PROVIDER=test  # Options: 'resend', 'sendgrid', 'test'
EMAIL_FROM=notifications@hopenet.example.com
EDGE_FUNCTION_SECRET=your_secret_key

# For production email sending, configure one of:
# RESEND_API_KEY=your_resend_api_key
# SENDGRID_API_KEY=your_sendgrid_api_key
```

See `.env.example` for all available options.

4. Run the development server:
   **Where to find these values:**

- Log in to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** → **API**
- Copy the **Project URL** and **anon/public** key

⚠️ **Important**: Never commit `.env.local` to version control. The `.gitignore` file is already configured to exclude it.

### Database Setup

Before running the application, you need to set up your Supabase database.

1. **Create the database schema:**

   Log in to your Supabase Dashboard, navigate to the **SQL Editor**, and run the following SQL:

```sql
-- Create missing_person_requests table
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
  message_from_found TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_missing_person_requests_parish ON missing_person_requests(parish);
CREATE INDEX idx_missing_person_requests_status ON missing_person_requests(status);
CREATE INDEX idx_missing_person_requests_created_at ON missing_person_requests(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE missing_person_requests ENABLE ROW LEVEL SECURITY;

-- Create policies (see Security & Privacy section for details)
-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON missing_person_requests
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON missing_person_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON missing_person_requests
  FOR UPDATE USING (auth.role() = 'authenticated');
```

2. **Seed the database** (optional but recommended for testing):

```bash
npm run seed
```

This will populate your database with sample missing person requests across all Jamaican parishes. See the [Seeding Data](#seeding-data) section for more details.

### Running the Application

1. **Start the development server:**

```bash
npm run dev
```

2. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the HopeNet homepage. You can now:

- Browse the homepage
- Submit a request at `/request`
- View the dashboard at `/dashboard` (requires seeded data)

![Dashboard Screenshot](./docs/screenshots/dashboard.png)
_Screenshot: Responder dashboard showing map and table views_

3. **Build for production:**

```bash
npm run build
npm run start
```

The production server will run on [http://localhost:3000](http://localhost:3000)

## Database Management

### Database Schema

The application uses a PostgreSQL database (via Supabase) with the following main table:

#### `missing_person_requests`

| Column               | Type      | Description                                  |
| -------------------- | --------- | -------------------------------------------- |
| `id`                 | UUID      | Primary key (auto-generated)                 |
| `created_at`         | TIMESTAMP | Record creation time (auto-set)              |
| `updated_at`         | TIMESTAMP | Last update time (auto-set)                  |
| `first_name`         | TEXT      | Missing person's first name                  |
| `last_name`          | TEXT      | Missing person's last name                   |
| `age`                | INTEGER   | Age of missing person                        |
| `description`        | TEXT      | Physical description                         |
| `last_seen_location` | TEXT      | Last known location                          |
| `last_seen_date`     | TIMESTAMP | When they were last seen                     |
| `parish`             | TEXT      | Jamaican parish (one of 14)                  |
| `contact_name`       | TEXT      | Contact person's name                        |
| `contact_phone`      | TEXT      | Contact phone number                         |
| `contact_email`      | TEXT      | Contact email                                |
| `status`             | TEXT      | Status: 'missing', 'found', or 'in_progress' |
| `photo_url`          | TEXT      | URL to person's photo                        |
| `notes`              | TEXT      | Additional notes                             |
| `message_from_found` | TEXT      | Message when person is found                 |

### Migrations

The database schema is version-controlled through SQL scripts. When making schema changes:

1. **Create a new migration file** in your Supabase Dashboard under **SQL Editor**

2. **Name your migration** with a timestamp and description:

   ```
   YYYYMMDD_description_of_change.sql
   ```

3. **Test the migration** in your development environment first

4. **Apply to production** only after thorough testing

**Example Migration** (adding a new field):

```sql
-- Migration: 20250103_add_verification_status.sql
-- Add verification status field

ALTER TABLE missing_person_requests
ADD COLUMN verification_status TEXT DEFAULT 'pending'
CHECK (verification_status IN ('pending', 'verified', 'flagged'));

-- Add index
CREATE INDEX idx_verification_status ON missing_person_requests(verification_status);
```

### Seeding Data

To populate your database with sample data for testing:

```bash
npm run seed
```

**What this does:**

- Generates 2-4 sample missing person requests for each of Jamaica's 14 parishes
- Creates realistic test data with names, locations, and contact information
- Assigns random statuses (weighted toward 'missing')
- Inserts all records into your Supabase database

**Sample Output:**

```
🌱 Starting database seed...
📊 Generated 42 sample requests across 14 parishes
💾 Inserting data into Supabase...
✅ Successfully inserted 42 records
🎉 Seed completed successfully!
```

**Customizing the seed data:**

- Edit `scripts/seed.ts` to modify sample data
- Adjust the number of requests per parish in the seed function
- Add or modify sample names, descriptions, and locations

For more details, see `scripts/README.md`.

## Deployment

### Edge Functions

Supabase Edge Functions allow you to run server-side code close to your users. Here's how to deploy custom functions:

#### Prerequisites

1. **Install Supabase CLI:**

```bash
npm install -g supabase
```

2. **Login to Supabase:**

```bash
supabase login
```

#### Creating an Edge Function

1. **Initialize your Supabase project locally:**

```bash
supabase init
```

2. **Create a new Edge Function:**

```bash
supabase functions new my-function
```

This creates a new function in `supabase/functions/my-function/index.ts`

3. **Example Edge Function** (Email Notification):

```typescript
// supabase/functions/notify-on-update/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { record } = await req.json();

  // Send email notification logic here
  console.log('New update:', record);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

4. **Deploy the Edge Function:**

```bash
supabase functions deploy my-function
```

5. **Set environment variables for the function:**

```bash
supabase secrets set MY_SECRET_KEY=value
```

#### Common Edge Function Use Cases

- **Email Notifications**: Send emails when a person is found
- **SMS Alerts**: Notify contacts via SMS
- **Data Validation**: Validate incoming requests
- **Image Processing**: Resize/optimize uploaded photos
- **Webhooks**: Integrate with external services

#### Testing Edge Functions Locally

```bash
supabase functions serve my-function
```

Then test with:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/my-function' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"record": {"id": "123"}}'
```

### Production Deployment

#### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**

```bash
npm i -g vercel
```

2. **Login to Vercel:**

```bash
vercel login
```

3. **Deploy:**

```bash
vercel
```

4. **Set environment variables in Vercel:**

Go to your project settings on Vercel and add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Deploy to production:**

```bash
vercel --prod
```

#### Alternative: Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

#### Environment Variables for Production

Ensure these are set in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## Security & Privacy

### Role Management

HopeNet implements role-based access control through Supabase authentication:

#### User Roles

1. **Anonymous Users** (Public)
   - Can view missing person requests
   - Can submit new requests
   - Cannot modify existing requests

2. **Authenticated Users** (Registered)
   - All anonymous user permissions
   - Can insert new requests (with attribution)
   - Can update request statuses
   - Can add messages when people are found

3. **Responders** (Trusted Team Members)
   - All authenticated user permissions
   - Access to responder dashboard
   - Can export data as CSV
   - Can see full contact information
   - Can update any request status

4. **Administrators**
   - Full database access
   - Can manage user roles
   - Can delete inappropriate content
   - Access to Supabase dashboard

#### Setting Up Roles

1. **Enable Email Authentication** in Supabase:
   - Go to **Authentication** → **Providers**
   - Enable Email provider

2. **Create Custom Claims** for roles:

```sql
-- Add a roles table
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'responder', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant responder access
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'responder');
```

3. **Update RLS Policies** to check roles:

```sql
-- Responders can update any request
CREATE POLICY "Responders can update" ON missing_person_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('responder', 'admin')
    )
  );
```

### Privacy Notes

#### Data Protection

HopeNet takes privacy seriously. Here's how we protect sensitive information:

1. **Personal Information**
   - Contact details are only visible to authenticated users
   - Email addresses are never displayed publicly
   - Phone numbers are formatted to prevent scraping

2. **Photo Management**
   - Photos are stored securely in Supabase Storage
   - Access is controlled via signed URLs
   - Photos can be removed upon request

3. **Data Retention**
   - Found persons' data can be archived after 90 days
   - Anonymous requests are retained for 1 year
   - Users can request data deletion at any time

4. **GDPR Compliance**
   - Right to access: Users can export their data
   - Right to deletion: Contact admins to remove data
   - Data minimization: Only collect necessary information

#### Best Practices

- ⚠️ **Never include sensitive information** in the description field
- ⚠️ **Avoid sharing exact addresses** - use general locations
- ⚠️ **Verify identity** before sharing contact information
- ⚠️ **Report suspicious activity** to administrators

#### Privacy Policy

Organizations deploying HopeNet should:

- Create a comprehensive privacy policy
- Obtain consent before collecting data
- Implement data retention policies
- Provide opt-out mechanisms
- Comply with local data protection laws

### Row Level Security

All database tables use Row Level Security (RLS) to ensure data access is properly controlled:

```sql
-- Public read access
CREATE POLICY "Anyone can read" ON missing_person_requests
  FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated can insert" ON missing_person_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only responders can update status
CREATE POLICY "Responders can update" ON missing_person_requests
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('responder', 'admin')
    )
  );

-- Only admins can delete
CREATE POLICY "Admins can delete" ON missing_person_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

**Important**: Always test RLS policies thoroughly before deploying to production.

## Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without making changes
- `npm run seed` - Seed database with sample data (requires Supabase setup)
- `node scripts/test-email.js` - Test email notification system

## Email Notifications

When a person's status is changed to "found" in the dashboard, the system automatically:

1. Updates the status in the database
2. Logs the change to the audit table (who changed it and when)
3. Sends an email notification to the requester's contact email

### Testing Email Notifications

```bash
# Test in development mode (emails logged to console)
EMAIL_PROVIDER=test node scripts/test-email.js

# Start dev server in another terminal
npm run dev

# Then run the test
node scripts/test-email.js
```

For detailed information about email notifications, audit logging, and configuration, see [docs/EMAIL_NOTIFICATIONS.md](docs/EMAIL_NOTIFICATIONS.md).

## Project Structure

```
find-love-ones/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Responder dashboard
│   │   ├── request/            # Submit request page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── DashboardMap.tsx    # Interactive map component
│   │   ├── DashboardTable.tsx  # Data table component
│   │   ├── RequestForm.tsx     # Missing person request form
│   │   ├── ThemeProvider.tsx   # MUI theme & dark mode
│   │   ├── Navigation.tsx      # Header navigation
│   │   └── Footer.tsx          # Footer component
│   └── lib/                    # Utilities and configs
│       ├── supabase.ts         # Supabase client
│       ├── constants/          # Constants and reference data
│       │   └── parishes.ts     # Jamaican parishes data
│       ├── types/              # TypeScript type definitions
│       │   └── database.ts     # Database types
│       ├── utils/              # Utility functions
│       │   └── csv-export.ts   # CSV export functionality
│       └── validations/        # Form validation schemas
├── public/                     # Static assets
│   ├── data/                   # Geographic data files
│   │   ├── jamaica-parishes.geojson   # Parish boundaries (GeoJSON)
│   │   └── jamaica-parishes.topojson  # Parish boundaries (TopoJSON)
│   └── docs/                   # Documentation assets
│       └── screenshots/        # Application screenshots
├── scripts/                    # Utility scripts
│   ├── seed.ts                 # Database seed script
│   └── README.md               # Seed script documentation
├── eslint.config.mjs           # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Jamaican Parishes Data

The project includes comprehensive data for all 14 Jamaican parishes:

- **Constants**: Parish names, counties, and metadata with coordinates (`src/lib/constants/parishes.ts`)
- **GeoJSON**: Map boundaries for visualization (`public/data/jamaica-parishes.geojson`)
- **TopoJSON**: Compressed map data (`public/data/jamaica-parishes.topojson`)

```typescript
import { JAMAICAN_PARISHES, PARISH_METADATA } from '@/lib/constants/parishes';

// Use in your components
const parishes = JAMAICAN_PARISHES; // ['Kingston', 'St. Andrew', ...]
const kingstonData = PARISH_METADATA['Kingston']; // { name, county, capital, lat, lng }
```

### Parish List

**Surrey County:**

- Kingston
- St. Andrew
- St. Thomas
- Portland

**Middlesex County:**

- St. Mary
- St. Ann
- Trelawny
- St. James
- Manchester
- Clarendon
- St. Catherine

**Cornwall County:**

- Hanover
- Westmoreland
- St. Elizabeth

## Roadmap

### Phase 1: Core Features ✅ (Complete)

- [x] Basic search and submit functionality
- [x] Responder dashboard with map and table views
- [x] Parish-based organization
- [x] Status management (missing, in progress, found)
- [x] CSV export functionality
- [x] Responsive design
- [x] Database seeding

### Phase 2: Enhanced Features 🚧 (In Progress)

- [ ] User authentication and accounts
- [ ] Photo upload functionality
- [ ] Advanced search filters (date range, age, status)
- [ ] Pagination for large datasets
- [ ] Print-friendly views for offline distribution

### Phase 3: Communication 📋 (Planned)

- [ ] Email notifications when status changes
- [ ] SMS alerts for critical updates
- [ ] In-app messaging between contacts and responders
- [ ] Push notifications for mobile web
- [ ] Webhook integrations for external systems

### Phase 4: Advanced Features 📋 (Planned)

- [ ] Multi-language support (English, Jamaican Patois)
- [ ] Offline mode with service workers
- [ ] Mobile app (React Native)
- [ ] QR code generation for requests
- [ ] Bulk import/export functionality
- [ ] Analytics dashboard for administrators

### Phase 5: Scale & Performance 📋 (Future)

- [ ] Elasticsearch integration for advanced search
- [ ] CDN for faster global access
- [ ] Load testing and optimization
- [ ] Real-time updates via WebSockets
- [ ] API rate limiting and security enhancements

### Community Requests

Have a feature idea? [Open an issue](https://github.com/cdopeter/find-love-ones/issues) with the `feature-request` label!

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**

2. **Clone your fork:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/find-love-ones.git
   cd find-love-ones
   ```

3. **Create a new branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes:**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation

5. **Test your changes:**

   ```bash
   npm run lint
   npm run format:check
   npm run build
   ```

6. **Commit your changes:**

   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

7. **Push to your fork:**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes

### Contribution Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Commits**: Use clear, descriptive commit messages
- **Documentation**: Update README and other docs as needed
- **Testing**: Ensure all existing tests pass
- **Issues**: Check existing issues before creating new ones

### Areas We Need Help

- 🐛 Bug fixes and testing
- 📝 Documentation improvements
- 🌍 Internationalization (i18n)
- ♿ Accessibility enhancements
- 🎨 UI/UX improvements
- 🔒 Security audits

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## Troubleshooting

### Common Issues

#### "Missing Supabase environment variables" Error

**Problem**: Application fails to start with environment variable error.

**Solution**:

1. Ensure `.env.local` exists in the project root
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Restart the development server after adding variables

#### Database Connection Failed

**Problem**: Cannot connect to Supabase database.

**Solution**:

1. Check your Supabase project is active
2. Verify credentials in `.env.local` are correct
3. Ensure your IP is not blocked (check Supabase dashboard)
4. Try regenerating the anon key in Supabase settings

#### "Table does not exist" Error When Seeding

**Problem**: Seed script fails with table not found error.

**Solution**:

1. Run the database schema SQL in Supabase SQL Editor
2. Verify the table was created: `SELECT * FROM missing_person_requests LIMIT 1;`
3. Check RLS policies are enabled

#### Build Errors

**Problem**: `npm run build` fails.

**Solution**:

1. Delete `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Try building again: `npm run build`

#### ESLint Not Found

**Problem**: `npm run lint` fails with "eslint: not found".

**Solution**:

1. Install dependencies: `npm install`
2. Verify eslint is in node_modules: `ls node_modules/.bin/eslint`
3. Run with npx: `npx eslint .`

#### Map Not Displaying

**Problem**: Dashboard map is blank or not loading.

**Solution**:

1. Check browser console for errors
2. Ensure Leaflet CSS is loaded
3. Verify GeoJSON data exists in `public/data/`
4. Check that coordinates in parish metadata are valid

#### Dark Mode Not Working

**Problem**: Theme toggle doesn't switch modes.

**Solution**:

1. Clear browser cache and cookies
2. Check localStorage for theme preference
3. Verify ThemeProvider is wrapping the app

### Getting Help

If you're still experiencing issues:

1. **Check existing issues**: [GitHub Issues](https://github.com/cdopeter/find-love-ones/issues)
2. **Ask questions**: Open a new issue with the `question` label
3. **Join discussions**: Participate in [GitHub Discussions](https://github.com/cdopeter/find-love-ones/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for communities in need**

If HopeNet has helped you or your organization, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code or documentation
- 📢 Sharing with others who might benefit

Together, we can help families reunite after disasters.
