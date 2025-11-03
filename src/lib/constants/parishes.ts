/**
 * Jamaican Parishes
 * Jamaica is divided into 14 parishes, grouped into 3 counties.
 */

export const JAMAICAN_PARISHES = [
  'Kingston',
  'St. Andrew',
  'St. Thomas',
  'Portland',
  'St. Mary',
  'St. Ann',
  'Trelawny',
  'St. James',
  'Hanover',
  'Westmoreland',
  'St. Elizabeth',
  'Manchester',
  'Clarendon',
  'St. Catherine',
] as const;

export type JamaicanParish = (typeof JAMAICAN_PARISHES)[number];

/**
 * Parishes grouped by county
 */
export const PARISHES_BY_COUNTY = {
  Surrey: ['Kingston', 'St. Andrew', 'St. Thomas', 'Portland'],
  Middlesex: [
    'St. Mary',
    'St. Ann',
    'Trelawny',
    'St. James',
    'Manchester',
    'Clarendon',
    'St. Catherine',
  ],
  Cornwall: ['Hanover', 'Westmoreland', 'St. Elizabeth'],
} as const;

/**
 * Parish metadata with coordinates for map center points
 */
export const PARISH_METADATA: Record<
  string,
  {
    name: string;
    county: 'Surrey' | 'Middlesex' | 'Cornwall';
    capital: string;
    lat: number;
    lng: number;
  }
> = {
  Kingston: {
    name: 'Kingston',
    county: 'Surrey',
    capital: 'Kingston',
    lat: 17.9714,
    lng: -76.7931,
  },
  'St. Andrew': {
    name: 'St. Andrew',
    county: 'Surrey',
    capital: 'Half Way Tree',
    lat: 18.0179,
    lng: -76.8099,
  },
  'St. Thomas': {
    name: 'St. Thomas',
    county: 'Surrey',
    capital: 'Morant Bay',
    lat: 17.8815,
    lng: -76.4093,
  },
  Portland: {
    name: 'Portland',
    county: 'Surrey',
    capital: 'Port Antonio',
    lat: 18.1774,
    lng: -76.4515,
  },
  'St. Mary': {
    name: 'St. Mary',
    county: 'Middlesex',
    capital: 'Port Maria',
    lat: 18.3686,
    lng: -76.8897,
  },
  'St. Ann': {
    name: 'St. Ann',
    county: 'Middlesex',
    capital: "St. Ann's Bay",
    lat: 18.4373,
    lng: -77.2009,
  },
  Trelawny: {
    name: 'Trelawny',
    county: 'Middlesex',
    capital: 'Falmouth',
    lat: 18.4919,
    lng: -77.6559,
  },
  'St. James': {
    name: 'St. James',
    county: 'Middlesex',
    capital: 'Montego Bay',
    lat: 18.4762,
    lng: -77.8939,
  },
  Hanover: {
    name: 'Hanover',
    county: 'Cornwall',
    capital: 'Lucea',
    lat: 18.451,
    lng: -78.1736,
  },
  Westmoreland: {
    name: 'Westmoreland',
    county: 'Cornwall',
    capital: 'Savanna-la-Mar',
    lat: 18.2186,
    lng: -78.1322,
  },
  'St. Elizabeth': {
    name: 'St. Elizabeth',
    county: 'Cornwall',
    capital: 'Black River',
    lat: 18.0261,
    lng: -77.8489,
  },
  Manchester: {
    name: 'Manchester',
    county: 'Middlesex',
    capital: 'Mandeville',
    lat: 18.0404,
    lng: -77.5064,
  },
  Clarendon: {
    name: 'Clarendon',
    county: 'Middlesex',
    capital: 'May Pen',
    lat: 17.9646,
    lng: -77.2416,
  },
  'St. Catherine': {
    name: 'St. Catherine',
    county: 'Middlesex',
    capital: 'Spanish Town',
    lat: 17.9912,
    lng: -76.9563,
  },
};
