import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sitesApi } from '../api/client';

import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/catalyst-ui/table';
import { Button } from '../components/catalyst-ui/button';
import { Input, InputGroup } from '../components/catalyst-ui/input';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownLabel } from '../components/catalyst-ui/dropdown';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '../components/catalyst-ui/dialog';
import { Field, Label } from '../components/catalyst-ui/fieldset';

const HealthScoreRing = ({ score, status }) => {
  // Updated to match backend status strings
  if (status === 'not_crawled' || status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative size-[52px] flex items-center justify-center rounded-full border-[4px] border-gray-100"></div>
        <span className="text-[13px] text-gray-500 font-semibold mt-2">0</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative size-[52px]">
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#F3F4F6" strokeWidth="4" />
        </svg>
        <div 
          className="absolute inset-0 size-full rounded-full"
          style={{
            background: 'conic-gradient(from 180deg, #EF4444 0%, #F59E0B 50%, #22C55E 100%)',
            WebkitMaskImage: 'radial-gradient(transparent 54%, black 55%)',
            maskImage: 'radial-gradient(transparent 54%, black 55%)',
            clipPath: `polygon(0 0, 100% 0, 100% ${score >= 50 ? '100%' : '50%'}, 0 ${score >= 50 ? '100%' : '50%'})`
          }}
        />
        <div className="absolute inset-[4px] bg-white rounded-full"></div>
      </div>
      <span className="text-[13px] font-bold text-gray-700 mt-2">{score}</span>
    </div>
  );
};

export default function SitesDashboard() {
  const queryClient = useQueryClient();
  
  // State for the Add Site modal
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');

  // 1. Fetch sites data from the backend
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesApi.getSites,
  });

  // 2. Add Site Mutation
  const addSiteMutation = useMutation({
    mutationFn: sitesApi.addSite,
    onSuccess: () => {
      // Refresh the table data
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      // Close the modal and reset form
      setIsAddSiteOpen(false);
      setNewSiteName('');
      setNewSiteUrl('');
    },
  });

  // 3. Setup mutation for starting a crawl
  const crawlMutation = useMutation({
    mutationFn: sitesApi.startCrawl,
    onSuccess: () => {
      // Refresh the table data when a crawl starts successfully
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  // Extract the actual array of sites from the backend response
  const sites = response?.data || [];

  // Helper to format the ISO date from backend
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Handle form submission
  const handleAddSiteSubmit = (e) => {
    e.preventDefault();
    if (!newSiteName || !newSiteUrl) return;
    
    // Add default values required by the backend API
    addSiteMutation.mutate({
      name: newSiteName,
      url: newSiteUrl,
      maxPages: 1000,
      crawlSubdomains: false,
      respectRobotsTxt: true,
      userAgent: "SiteAuditBot/1.0",
      maxDepth: 10,
      crawlSpeed: "normal"
    });
  };

  return (
    <div className="px-10 py-8 max-w-[1400px] mx-auto bg-white min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Sites</h1>
        <div className="flex items-center justify-between">
          <div className="w-[400px]">
            <InputGroup>
              <svg data-slot="icon" className="text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input type="text" placeholder="Search Sites" className="border-gray-200 shadow-sm" />
            </InputGroup>
          </div>
          <div className="flex gap-4">
            <Button className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-50 !shadow-sm font-semibold flex items-center gap-2">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Issue Settings
            </Button>
            {/* Open Modal on Click */}
            <Button 
              onClick={() => setIsAddSiteOpen(true)}
              className="!bg-gray-900 !text-white hover:!bg-black !shadow-sm font-semibold flex items-center gap-2"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add New Site
            </Button>
          </div>
        </div>
      </div>

      <Table className="[&_th]:text-gray-500 [&_th]:font-medium [&_th]:text-sm [&_th]:border-b [&_th]:border-gray-200 [&_th]:pb-4">
        <TableHead>
          <TableRow>
            <TableHeader>Site</TableHeader>
            <TableHeader>Last crawl</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-center">Health score</TableHeader>
            <TableHeader>URL Crawled</TableHeader>
            <TableHeader>URLs having errors</TableHeader>
            <TableHeader><span className="sr-only">Actions</span></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Loading State */}
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500 font-medium">
                Loading sites from backend...
              </TableCell>
            </TableRow>
          )}

          {/* Error State */}
          {isError && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-red-500 font-medium">
                Failed to load sites. Ensure your backend server is running on http://localhost:3000
              </TableCell>
            </TableRow>
          )}

          {/* Empty State */}
          {!isLoading && !isError && sites.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                <p className="font-medium text-gray-900 mb-1">No sites found</p>
                <p className="text-sm text-gray-500 mb-4">Get started by adding a new site.</p>
                <Button onClick={() => setIsAddSiteOpen(true)} className="!bg-white !text-gray-900 !border !border-gray-200 hover:!bg-gray-50 font-semibold shadow-sm">
                  Add New Site
                </Button>
              </TableCell>
            </TableRow>
          )}

          {/* Actual Data */}
          {!isLoading && !isError && sites.map((site) => (
            <TableRow key={site.id} className="border-b border-gray-100/80 hover:bg-gray-50/50 transition-colors">
              <TableCell className="py-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-14 bg-gray-100 rounded-md border border-gray-200 flex items-end justify-center overflow-hidden">
                    <div className="w-10 h-8 bg-gray-300/80 rounded-t-lg"></div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-900">{site.name}</span>
                    <a href={site.url} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-[#3B82F6] hover:text-blue-700 underline decoration-transparent hover:decoration-blue-700 underline-offset-2">Open</a>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-gray-600 font-medium">{formatDate(site.lastCrawl)}</TableCell>

              <TableCell>
                {site.status === 'not_crawled' ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">Not Crawled</span>
                ) : site.status === 'failed' ? (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">Failed</span>
                ) : site.status === 'crawling' ? (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">Crawling...</span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-[#ECFCCB] px-2 py-1 text-xs font-semibold text-[#4D7C0F]">Completed</span>
                )}
              </TableCell>

              <TableCell>
                <HealthScoreRing score={site.healthScore} status={site.status} />
              </TableCell>

              <TableCell className="text-gray-600 font-medium">
                {site.status === 'not_crawled' ? '-' : site.urlsCrawled.toLocaleString()}
              </TableCell>

              <TableCell>
                <span className={site.errorsCount > 0 ? 'text-red-500 font-semibold' : 'text-gray-600 font-medium'}>
                  {site.status === 'not_crawled' ? '-' : site.errorsCount.toLocaleString()}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-3">
                  {(site.status === 'completed' || site.status === 'not_crawled') && (
                    <Button 
                      onClick={() => crawlMutation.mutate(site.id)}
                      disabled={crawlMutation.isPending}
                      className="!bg-white !text-gray-900 !border !border-gray-200 hover:!bg-gray-50 font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      {crawlMutation.isPending ? 'Starting...' : 'Crawl now'}
                    </Button>
                  )}
                  {site.status === 'crawling' && (
                    <Button className="!bg-white !text-gray-900 !border !border-gray-200 hover:!bg-gray-50 font-semibold shadow-sm flex items-center gap-2">
                      <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                      Stop Crawling
                    </Button>
                  )}
                  {site.status === 'failed' && (
                    <Button 
                      onClick={() => crawlMutation.mutate(site.id)}
                      disabled={crawlMutation.isPending}
                      className="!bg-white !text-red-600 !border !border-gray-200 hover:!bg-gray-50 font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                       <svg className="size-3 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                      Try crawling again
                    </Button>
                  )}
                  
                  <Dropdown>
                    <DropdownButton className="!bg-[#18181b] !text-white !border-transparent hover:!bg-black !px-1.5 py-1.5 shadow-sm rounded">
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem><DropdownLabel>View details</DropdownLabel></DropdownItem>
                      <DropdownItem><DropdownLabel className="text-red-600">Delete site</DropdownLabel></DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Catalyst Dialog for Adding a New Site */}
      <Dialog open={isAddSiteOpen} onClose={setIsAddSiteOpen}>
        <form onSubmit={handleAddSiteSubmit}>
          <DialogTitle>Add New Site</DialogTitle>
          <DialogDescription>
            Enter the details of the website you want to audit.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <Field>
                <Label>Site Name</Label>
                <Input 
                  required 
                  value={newSiteName} 
                  onChange={(e) => setNewSiteName(e.target.value)} 
                  placeholder="e.g. CodeDesign webs" 
                />
              </Field>
              <Field>
                <Label>Site URL</Label>
                <Input 
                  required 
                  type="url"
                  value={newSiteUrl} 
                  onChange={(e) => setNewSiteUrl(e.target.value)} 
                  placeholder="https://example.com" 
                />
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setIsAddSiteOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={addSiteMutation.isPending} className="!bg-gray-900 !text-white hover:!bg-black">
              {addSiteMutation.isPending ? 'Adding...' : 'Add Site'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}