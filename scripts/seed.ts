#!/usr/bin/env node

/**
 * Seed script to populate the database with sample missing person requests
 * across all Jamaican parishes.
 *
 * This script creates realistic sample data for testing and development purposes.
 * It ensures at least one request per parish.
 *
 * Usage: npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import { JAMAICAN_PARISHES } from '../src/lib/constants/parishes';
import type { MissingPersonRequest } from '../src/lib/types/database';

// Sample first names
const FIRST_NAMES = [
  'James',
  'John',
  'Robert',
  'Michael',
  'David',
  'William',
  'Mary',
  'Patricia',
  'Jennifer',
  'Linda',
  'Elizabeth',
  'Barbara',
  'Marcus',
  'Andre',
  'Devon',
  'Kemar',
  'Tyrone',
  'Shawn',
  'Latoya',
  'Kimberly',
  'Simone',
  'Natasha',
  'Tamika',
  'Shanice',
];

// Sample last names
const LAST_NAMES = [
  'Brown',
  'Williams',
  'Jones',
  'Miller',
  'Davis',
  'Garcia',
  'Thompson',
  'Campbell',
  'Morrison',
  'Reid',
  'Grant',
  'Clarke',
  'Bennett',
  'Powell',
  'Stewart',
  'Palmer',
  'Simpson',
  'Walker',
];

// Sample locations per parish
const LOCATIONS_BY_PARISH: Record<string, string[]> = {
  Kingston: [
    'Downtown Kingston',
    'New Kingston',
    'Tivoli Gardens',
    'Trench Town',
  ],
  'St. Andrew': [
    'Half Way Tree',
    'Liguanea',
    'Constant Spring',
    'Stony Hill',
    'Papine',
  ],
  'St. Thomas': ['Morant Bay', 'Yallahs', 'Port Morant', 'Bath'],
  Portland: ['Port Antonio', 'Boston Bay', 'Long Bay', 'Buff Bay'],
  'St. Mary': ['Port Maria', 'Ocho Rios', 'Annotto Bay', 'Highgate'],
  'St. Ann': ["St. Ann's Bay", 'Ocho Rios', 'Runaway Bay', "Brown's Town"],
  Trelawny: ['Falmouth', 'Duncans', 'Rio Bueno', 'Martha Brae'],
  'St. James': ['Montego Bay', 'Reading', 'Anchovy', 'Cambridge'],
  Hanover: ['Lucea', 'Green Island', 'Sandy Bay', 'Hopewell'],
  Westmoreland: ['Savanna-la-Mar', 'Negril', 'Whitehouse', 'Little London'],
  'St. Elizabeth': ['Black River', 'Santa Cruz', 'Junction', 'Treasure Beach'],
  Manchester: ['Mandeville', 'Christiana', 'Porus', 'Williamsfield'],
  Clarendon: ['May Pen', 'Chapelton', 'Four Paths', 'Lionel Town'],
  'St. Catherine': ['Spanish Town', 'Portmore', 'Old Harbour', 'Linstead'],
};

// Sample descriptions
const DESCRIPTIONS = [
  'Last seen wearing blue jeans and white t-shirt',
  'Wearing glasses, medium build',
  'Tall, athletic build, short hair',
  'Medium height, wearing red shirt',
  'Short hair, carrying black backpack',
  'Long hair, wearing floral dress',
  'Wearing school uniform',
  'Elderly, walking with a cane',
];

// Sample contact names (family members)
const CONTACT_RELATIONS = [
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Wife',
  'Husband',
  'Daughter',
  'Son',
  'Aunt',
  'Uncle',
  'Cousin',
  'Friend',
];

/**
 * Generate a random item from an array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random date within the last 30 days
 */
function randomRecentDate(): string {
  const now = new Date();
  const daysAgo = randomInt(1, 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

/**
 * Generate a sample phone number
 */
function generatePhoneNumber(): string {
  const prefix = randomItem(['876-', '+1-876-']);
  const number = `${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
  return prefix + number;
}

/**
 * Generate a sample missing person request for a specific parish
 */
function generateSampleRequest(parish: string): MissingPersonRequest {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const requesterFirstName = randomItem(FIRST_NAMES);
  const requesterLastName = randomItem(LAST_NAMES);
  const locations = LOCATIONS_BY_PARISH[parish] || [parish];
  const location = randomItem(locations);
  const statuses: Array<'open' | 'closed'> = [
    'open',
    'open',
    'open',
    'closed',
  ];

  return {
    target_first_name: firstName,
    target_last_name: lastName,
    last_known_address: location,
    parish: parish,
    requester_first_name: requesterFirstName,
    requester_last_name: requesterLastName,
    requester_email: `${requesterFirstName.toLowerCase()}.${requesterLastName.toLowerCase()}@example.com`,
    requester_phone: generatePhoneNumber(),
    status: randomItem(statuses),
    message_to_person: `Please contact us. Family is very concerned.`,
  };
}

/**
 * Main seed function
 */
async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  // Check for environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error(
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
    console.error('Copy .env.example to .env.local and add your credentials\n');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Generate sample requests - at least 2 per parish, with some parishes having more
  const requests: MissingPersonRequest[] = [];

  for (const parish of JAMAICAN_PARISHES) {
    // Each parish gets 2-4 requests
    const requestCount = randomInt(2, 4);
    for (let i = 0; i < requestCount; i++) {
      requests.push(generateSampleRequest(parish));
    }
  }

  console.log(
    `📊 Generated ${requests.length} sample requests across ${JAMAICAN_PARISHES.length} parishes\n`
  );

  // Display summary by parish
  const parishCounts: Record<string, number> = {};
  for (const request of requests) {
    parishCounts[request.parish] = (parishCounts[request.parish] || 0) + 1;
  }

  console.log('Parish Distribution:');
  for (const parish of JAMAICAN_PARISHES) {
    console.log(`  ${parish.padEnd(20)} : ${parishCounts[parish]} requests`);
  }
  console.log();

  // Insert into database
  console.log('💾 Inserting data into Supabase...\n');

  try {
    const { data, error } = await supabase
      .from('requests')
      .insert(requests)
      .select();

    if (error) {
      console.error('❌ Error inserting data:', error.message);
      console.error(
        '\nMake sure you have created the requests table in Supabase.'
      );
      console.error('See the database schema in the project documentation.\n');
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} records\n`);
    console.log('🎉 Seed completed successfully!\n');
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
