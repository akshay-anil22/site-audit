const BASE_URL = "http://localhost:3000/api";

export const sitesApi = {
  getSites: async () => {
    const response = await fetch(`${BASE_URL}/sites`);
    if (!response.ok) throw new Error("Failed to fetch sites");
    return response.json();
  },

  addSite: async (siteData) => {
    const response = await fetch(`${BASE_URL}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteData),
    });
    if (!response.ok) throw new Error("Failed to add site");
    return response.json();
  },

  deleteSite: async (siteId) => {
    const response = await fetch(`${BASE_URL}/sites/${siteId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete site");
    return response.json();
  },

  startCrawl: async (siteId) => {
    const response = await fetch(`${BASE_URL}/crawls/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId }),
    });
    if (!response.ok) throw new Error("Failed to start crawl");
    return response.json();
  },

  stopCrawl: async (crawlId) => {
    const response = await fetch(`${BASE_URL}/crawls/${crawlId}/stop`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to stop crawl");
    return response.json();
  },

  getCrawlDetails: async (crawlId) => {
    const response = await fetch(`${BASE_URL}/crawls/${crawlId}`);
    if (!response.ok) throw new Error("Failed to fetch crawl details");
    return response.json();
  },

  getCrawlIssues: async (crawlId) => {
    const response = await fetch(
      `${BASE_URL}/crawls/${crawlId}/issues?limit=500`,
    );
    if (!response.ok) throw new Error("Failed to fetch crawl issues");
    return response.json();
  },
};
