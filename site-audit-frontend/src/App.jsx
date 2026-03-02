import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppLayout from './components/AppLayout';
import SitesDashboard from './pages/SitesDashboard';
import CrawlDetails from './pages/CrawlDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});



export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/sites" replace />} />
            <Route path="/sites" element={<SitesDashboard />} />
            <Route path="/crawls/:crawlId" element={<CrawlDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}