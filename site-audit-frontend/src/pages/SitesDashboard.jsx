import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sitesApi } from '../api/client';
import { Link } from 'react-router-dom';


import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/catalyst-ui/table';
import { Button } from '../components/catalyst-ui/button';
import { Input, InputGroup } from '../components/catalyst-ui/input';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownLabel } from '../components/catalyst-ui/dropdown';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '../components/catalyst-ui/dialog';
import { Field, Label } from '../components/catalyst-ui/fieldset';

import { HealthScoreCircle } from '../components/catalyst-ui/healthScoreCircle';

const HealthScoreRing = ({ score, status }) => {
  const isPending = status === 'not_crawled' || status === 'failed';
  const displayScore = isPending ? 0 : score;

  return (
    <div className="flex flex-col items-center justify-center">
      <HealthScoreCircle 
        score={displayScore} 
        size={52}          
        strokeWidth={6}    
        showLabel={false}  
      />
      <span className={`text-[13px] mt-2 ${isPending ? 'text-gray-500 font-semibold' : 'text-gray-700 font-bold'}`}>
        {displayScore}
      </span>
    </div>
  );
};

export default function SitesDashboard() {
  const queryClient = useQueryClient();
  
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesApi.getSites,
    refetchInterval: 1000, 
  });

  const addSiteMutation = useMutation({
    mutationFn: sitesApi.addSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsAddSiteOpen(false);
      setNewSiteName('');
      setNewSiteUrl('');
    },
  });

  const crawlMutation = useMutation({
    mutationFn: sitesApi.startCrawl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  const stopCrawlMutation = useMutation({
    mutationFn: sitesApi.stopCrawl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sitesApi.deleteSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  const sites = response?.data || [];
  const filteredSites = sites.filter(site =>
    site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const handleAddSiteSubmit = (e) => {
    e.preventDefault();
    if (!newSiteName || !newSiteUrl) return;
    
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
    <div className="px-3 sm:px-6 lg:px-10 py-4 sm:py-8 max-w-[1400px] mx-auto bg-white min-h-screen">
      <div className="mb-5 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 sm:mb-8 tracking-tight">Sites</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-[400px]">
            <InputGroup>
              <svg data-slot="icon" className="text-gray-400 size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search Sites"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm text-zinc-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </InputGroup>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Button className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-50 !shadow-sm font-semibold flex items-center gap-2">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Issue Settings</span>
            </Button>
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

      <div className="overflow-x-auto -mx-3 sm:-mx-6 lg:mx-0">
      <Table className="min-w-[680px] [&_th]:text-gray-500 [&_th]:font-medium [&_th]:text-sm [&_th]:border-b [&_th]:border-gray-200 [&_th]:pb-4">
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
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500 font-medium">Loading sites from backend...</TableCell>
            </TableRow>
          )}

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

          {!isLoading && !isError && sites.length > 0 && filteredSites.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                <p className="font-medium text-gray-900 mb-1">No sites match "{searchQuery}"</p>
                <p className="text-sm text-gray-500">Try a different name or URL.</p>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && filteredSites.map((site) => (
            <TableRow key={site.id} className="border-b border-gray-100/80 hover:bg-gray-50/50 transition-colors">
              <TableCell className="py-5">
                <div className="flex items-center gap-4">
                  <img
                    src="/dummy img.png"
                    alt="site thumbnail"
                    className="h-12 w-14 rounded-md border border-gray-200 object-contain bg-gray-50"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-900">{site.name}</span>
                    <Link 
                      to={`/crawls/${site.id}`} 
                      className="text-[13px] font-semibold text-[#3B82F6] hover:text-blue-700 underline decoration-transparent hover:decoration-blue-700 underline-offset-2"
                    >
                      Open
                    </Link>

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
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 animate-pulse">Crawling...</span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-[#ECFCCB] px-2 py-1 text-xs font-semibold text-[#4D7C0F]">Completed</span>
                )}
              </TableCell>

              <TableCell>
                <HealthScoreRing 
                  score={site.healthScore || Math.max(100 - Math.floor(((site.errorsCount || 0) / (site.urlsCrawled || 1)) * 100), 0)} 
                  status={site.status} 
                />
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
                  {site.status === 'crawling' ? (
                    <Button 
                      onClick={() => stopCrawlMutation.mutate(site.latestCrawlId || site.id)}
                      disabled={stopCrawlMutation.isPending && stopCrawlMutation.variables === (site.latestCrawlId || site.id)}
                      className="!bg-white !text-gray-700 !border !border-gray-200 hover:!bg-gray-50 font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="#09090B"/>
                        <path d="M15.536 8.464a1 1 0 010 1.415L13.414 12l2.122 2.121a1 1 0 11-1.415 1.415L12 13.414l-2.121 2.122a1 1 0 01-1.415-1.415L10.586 12 8.464 9.879a1 1 0 011.415-1.415L12 10.586l2.121-2.122a1 1 0 011.415 0z" fill="white"/>
                      </svg>
                      {stopCrawlMutation.isPending && stopCrawlMutation.variables === (site.latestCrawlId || site.id) ? 'Stopping...' : 'Stop Crawling'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => crawlMutation.mutate(site.id)}
                      disabled={crawlMutation.isPending && crawlMutation.variables === site.id}
                      className="!bg-white !text-gray-900 !border !border-gray-200 hover:!bg-gray-50 font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      {crawlMutation.isPending && crawlMutation.variables === site.id ? 'Starting...' : 'Crawl now'}
                    </Button>
                  )}
                  
                  <Dropdown>
                    <DropdownButton className="!bg-white !text-gray-500 !border !border-gray-200 hover:!bg-gray-50 !px-2 shadow-sm">
                      <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem href={`/crawls/${site.id}`}>
                        <DropdownLabel>View details</DropdownLabel>
                      </DropdownItem>
                      <DropdownItem onClick={() => deleteMutation.mutate(site.id)}>
                        <DropdownLabel className="text-red-600">
                          {deleteMutation.isPending && deleteMutation.variables === site.id ? 'Deleting...' : 'Delete site'}
                        </DropdownLabel>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

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