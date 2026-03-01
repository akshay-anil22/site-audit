import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- IMPORTS ---
import AppLayout from './components/AppLayout';
import SitesDashboard from './pages/SitesDashboard';
import CrawlDetails from './pages/CrawlDetails'; // <-- This was the missing line!

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Stops the annoying tab-switch reload
      staleTime: 1000 * 60 * 5, // Caches the data for 5 minutes
    },
  },
});



export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Redirect root to /sites */}
            <Route path="/" element={<Navigate to="/sites" replace />} />
            
            {/* Dashboard Route */}
            <Route path="/sites" element={<SitesDashboard />} />
            
            {/* Crawl Details Route */}
            <Route path="/crawls/:crawlId" element={<CrawlDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}