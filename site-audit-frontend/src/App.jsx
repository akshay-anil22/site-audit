// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/AppLayout';
import SitesDashboard from './pages/SitesDashboard'

// Initialize React Query
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Automatically redirect the root URL to /sites */}
            <Route path="/" element={<Navigate to="/sites" replace />} />
            
            {/* The actual dashboard route */}
            <Route path="/sites" element={<SitesDashboard />} />
            
            {/* We will add CrawlDetails here later */}
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}