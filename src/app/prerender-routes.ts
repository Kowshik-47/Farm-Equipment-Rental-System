import { environment } from '../environments/environment';

export async function getPrerenderParams(): Promise<string[]> {
  const response = await fetch(`${environment.apiUrl}/equipment`);
  const equipment = await response.json();
  return equipment.map((item: any) => item._id); // Return array of IDs
}

export const prerenderRoutes = [
  { route: '/' },
  { route: '/equipment' },
  { route: '/auth/login' },
  { route: '/farmer/equipment/:id', getPrerenderParams }
];
