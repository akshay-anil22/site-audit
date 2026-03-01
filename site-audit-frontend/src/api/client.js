// src/api/client.js
const BASE_URL = 'http://localhost:3000/api';

export const sitesApi = {
  // Fetch all sites
  getSites: async () => {
    const response = await fetch(`${BASE_URL}/sites`);
    if (!response.ok) throw new Error('Failed to fetch sites');
    return response.json();
  },

  // Add a new site
  addSite: async (siteData) => {
    const response = await fetch(`${BASE_URL}/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteData),
    });
    if (!response.ok) throw new Error('Failed to add site');
    return response.json();
  },

  // Start a crawl for a specific site
  startCrawl: async (siteId) => {
    const response = await fetch(`${BASE_URL}/crawls/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId }),
    });
    if (!response.ok) throw new Error('Failed to start crawl');
    return response.json();
  }
};