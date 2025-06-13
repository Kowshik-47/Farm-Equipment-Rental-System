export async function getPrerenderParams(): Promise<string[]> {
  // Fetch equipment IDs from your back-end API
  // Example: Call your Node.js API to get equipment IDs
  const response = await fetch('http://localhost:3000/api/equipment');
  const equipment = await response.json();
  return equipment.map((item: any) => item._id); // Return array of IDs
}

export const prerenderRoutes = [
  { route: '/' },
  { route: '/equipment' },
  { route: '/hire' },
  { route: '/auth/login' },
  { route: '/farmer/equipment/:id', getPrerenderParams }
];
