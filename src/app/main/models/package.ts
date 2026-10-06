export interface PricingPackage {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  currency: string;
  description: string;
  testSetsPerModule: number;
  accessDays: number;
  popular?: boolean;
}

export const PACKAGES: PricingPackage[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    originalPrice: 29.99,
    price: 24.99,
    currency: 'USD',
    description: 'Boost your Reading & Listening scores with practice sets that come with assessment scores.',
    testSetsPerModule: 15,
    accessDays: 30,
  },
  {
    id: 'silver',
    name: 'Silver',
    originalPrice: 49.99,
    price: 39.99,
    currency: 'USD',
    description: 'Our most popular package, with 10 more test sets and extra time to work through them.',
    testSetsPerModule: 25,
    accessDays: 45,
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    originalPrice: 70.0,
    price: 54.99,
    currency: 'USD',
    description: 'A premium package with our full test bank and the longest access window.',
    testSetsPerModule: 35,
    accessDays: 60,
  },
];

export function findPackage(id: string | null): PricingPackage | undefined {
  return PACKAGES.find((p) => p.id === id);
}
