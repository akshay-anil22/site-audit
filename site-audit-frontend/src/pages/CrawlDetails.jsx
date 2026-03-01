import React, { useMemo, useState, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sitesApi } from '../api/client';

// Core UI Components
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/catalyst-ui/table';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownLabel } from '../components/catalyst-ui/dropdown';
import { Button } from '../components/catalyst-ui/button';

// Custom Components
import { HealthScoreCircle } from '../components/catalyst-ui/healthScoreCircle';
import CustomPagination from '../components/catalyst-ui/CustomPagination';

// Icons
import { 
  GlobeAltIcon, ChevronRightIcon, ChevronDownIcon, 
  PlayIcon, ArrowDownTrayIcon, EllipsisHorizontalIcon,
  ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon,
  ChevronUpDownIcon,StopIcon
} from '@heroicons/react/20/solid';

// --- CONFIGURATION LOGIC ---
const SECTION_CONFIG = {
  critical: { label: 'Critical Health', text: 'text-zinc-950', bg: 'bg-[#A1A1AA]' },
  seo: { label: 'SEO Essentials', text: 'text-zinc-950', bg: 'bg-[#A1A1AA]' },
  content: { label: 'Content & Structure', text: 'text-zinc-950', bg: 'bg-[#A1A1AA]' },
  performance: { label: 'Performance & User Experience', text: 'text-zinc-950', bg: 'bg-[#A1A1AA]' }
};

const SECTION_CATEGORY_MAP = {
  critical: ['HTTP Status Codes', 'Security & HTTPS', 'Indexability', 'Redirects'],
  seo: ['Titles', 'Meta Descriptions', 'Canonical Tags', 'Structured Data', 'Sitemaps', 'Robots.txt', 'Localization (Hreflang)', 'Social Tags'],
  content: ['Headings (H1-H6)', 'Content', 'Images', 'Links'],
  performance: ['Performance', 'Core Web Vitals', 'Mobile Usability']
};

const SECTION_ORDER = ['critical', 'seo', 'content', 'performance'];

const getIssueSectionKey = (issue) => {
  const category = issue?.category || '';
  const entry = Object.entries(SECTION_CATEGORY_MAP).find(([, categories]) => categories.includes(category));
  return entry ? entry[0] : 'seo'; 
};

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);

export default function CrawlDetails() {
  const { crawlId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeToggle, setActiveToggle] = useState('actual');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const cachedSites = queryClient.getQueryData(['sites'])?.data || [];
  const currentSite = cachedSites.find(site => site.id.toString() === crawlId) || {};
  const actualCrawlId = currentSite.latestCrawlId || currentSite.lastCrawlId || crawlId;

  const { data: detailsResp, isLoading: detailsLoading } = useQuery({
    queryKey: ['crawlDetails', actualCrawlId],
    queryFn: () => sitesApi.getCrawlDetails(actualCrawlId),
   
  });

  const { data: issuesResp, isLoading: issuesLoading } = useQuery({
    queryKey: ['crawlIssues', actualCrawlId],
    queryFn: () => sitesApi.getCrawlIssues(actualCrawlId),
   
  });

  const crawlMutation = useMutation({
    mutationFn: sitesApi.startCrawl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['crawlDetails'] });
      queryClient.invalidateQueries({ queryKey: ['crawlIssues'] });
      setCurrentPage(1); 
    },
  });

  const stopCrawlMutation = useMutation({
    mutationFn: sitesApi.stopCrawl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['crawlDetails'] });
      queryClient.invalidateQueries({ queryKey: ['crawlIssues'] });
    },
  });

  const details = { ...currentSite, ...(detailsResp?.data || {}) };
  const issues = issuesResp?.data || [];

  const errorsCount = details.pagesWithErrors || details.errorsCount || details.urlsErrors || 0;
  const warningsCount = details.warningsCount || 0;

  // Filter Logic
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'important') {
        return issue.severity === 'error' || issue.impact === 'high';
      }
      return issue.status === statusFilter;
    });
  }, [issues, statusFilter]);

  // Group Filtered Issues
  const allGroupedIssues = useMemo(() => {
    const grouped = SECTION_ORDER.reduce((acc, key) => { acc[key] = []; return acc; }, {});
    filteredIssues.forEach((issue) => {
      const key = getIssueSectionKey(issue);
      grouped[key].push(issue);
    });
    return SECTION_ORDER
      .map((key) => ({ key, section: SECTION_CONFIG[key], items: grouped[key] }))
      .filter((group) => group.items.length > 0);
  }, [filteredIssues]);

  // Flatten for Pagination Engine
  const flatIssues = useMemo(() => {
    return allGroupedIssues.flatMap((group) =>
      group.items.map((item) => ({ ...item, _sectionKey: group.key }))
    );
  }, [allGroupedIssues]);

  const totalItems = flatIssues.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Slice current page items
  const paginatedGroupedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const pageItems = flatIssues.slice(start, start + pageSize);

    const grouped = {};
    pageItems.forEach((item) => {
      const key = item._sectionKey;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return SECTION_ORDER
      .filter((key) => grouped[key]?.length)
      .map((key) => ({ key, section: SECTION_CONFIG[key], items: grouped[key] }));
  }, [flatIssues, currentPage, pageSize]);

  // UI Badges logic based on the FILTERED data
  const actualCount = totalItems;
  const newCount = flatIssues.filter(issue => (issue.new > 0 || issue.added > 0)).length;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <ExclamationCircleIcon className="size-4 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="size-4 text-amber-500" />;
      default: return <InformationCircleIcon className="size-4 text-blue-500" />;
    }
  };

  const displayTitle = details.name || details.url || 'Website Details';
  const healthScore = details.healthScore || Math.max(100 - Math.floor((errorsCount / (details.urlsCrawled || 1)) * 100), 0);

  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setCurrentPage(1); 
  };

const isInitialLoading = (detailsLoading && !detailsResp) || (issuesLoading && !issuesResp);
  
  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="size-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium">Loading crawl data from backend...</div>
      </div>
    );
  }
  return (
    <div className="px-10 py-8 max-w-[1400px] mx-auto bg-white min-h-screen">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <button onClick={() => navigate('/sites')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <GlobeAltIcon className="size-5" />
            <span>All Sites</span>
          </button>
          <ChevronRightIcon className="size-4 text-gray-400" />
          <span className="text-lg tracking-tight">{displayTitle}</span>
          
          {details.status === 'crawling' && (
             <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 animate-pulse">
               Crawling in progress...
             </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} <ChevronDownIcon className="size-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            Compare with <ChevronDownIcon className="size-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-md text-[13px] font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
            Fix all errors using AI
          </button>
         {details.status === 'crawling' ? (
            <button 
              onClick={() => stopCrawlMutation.mutate(actualCrawlId)}
              disabled={stopCrawlMutation.isPending}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-md text-[13px] font-semibold shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <StopIcon className="size-4" /> 
              {stopCrawlMutation.isPending ? 'Stopping...' : 'Stop Crawl'}
            </button>
          ) : (
            <button 
              onClick={() => crawlMutation.mutate(currentSite.id || crawlId)}
              disabled={crawlMutation.isPending}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#18181b] text-white rounded-md text-[13px] font-semibold shadow-sm hover:bg-black transition-colors disabled:opacity-50"
            >
              <PlayIcon className="size-3" /> 
              {crawlMutation.isPending ? 'Starting...' : 'Crawl now'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Stats Cards Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col items-center">
          <div className="flex w-full justify-between items-start mb-2">
            <h3 className="font-bold text-[14px] text-gray-900">Health score</h3>
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              31%
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-2">
            <HealthScoreCircle 
              score={Number.isFinite(healthScore) ? healthScore : 0} 
              size={100} 
              strokeWidth={14} 
            />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-[14px] text-gray-900">URLs crawled</h3>
          </div>
          <div className="text-[32px] font-black tracking-tight text-gray-900 mb-4">
            {formatNumber(details.urlsCrawled)}
          </div>
          <div className="mt-auto space-y-2 text-[13px] font-medium">
            <div className="flex justify-between text-gray-500 border-b border-gray-100 pb-1">
              <span>Internal page</span>
              <span className="text-gray-900 font-bold">{formatNumber(details.internalPages || details.urlsCrawled)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Resources</span>
              <span className="text-gray-900 font-bold">{formatNumber(details.resources)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-[14px] text-gray-900">Pages errors</h3>
          </div>
          <div className="text-[32px] font-black tracking-tight text-gray-900 mb-4">
            {formatNumber(errorsCount)}
          </div>
          <div className="mt-auto space-y-2 text-[13px] font-medium">
            <div className="flex justify-between text-gray-500 border-b border-gray-100 pb-1">
              <span>Pages with error</span>
              <span className="text-gray-900 font-bold">{formatNumber(errorsCount)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Pages without errors</span>
              <span className="text-gray-900 font-bold">
                {formatNumber(Math.max((details.urlsCrawled || 0) - errorsCount, 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col">
          <h3 className="font-bold text-[14px] text-gray-900 mb-4">Issues distribution</h3>
          <div className="mt-auto space-y-2 text-[13px] font-medium">
            <div className="flex justify-between items-center border-b border-gray-100 pb-1 py-1">
              <span className="flex items-center gap-2 text-gray-500"><ExclamationCircleIcon className="size-4 text-red-500"/> Errors:</span>
              <span className="text-gray-900 font-bold">{formatNumber(errorsCount)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-1 py-1">
              <span className="flex items-center gap-2 text-gray-500"><ExclamationTriangleIcon className="size-4 text-amber-500"/> Warnings:</span>
              <span className="text-gray-900 font-bold">{formatNumber(warningsCount)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="flex items-center gap-2 text-gray-500"><InformationCircleIcon className="size-4 text-blue-500"/> Notices:</span>
              <span className="text-gray-900 font-bold">{formatNumber(details.noticesCount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Table Toolbar with EXACT Figma Styling */}
      <div className="flex flex-wrap items-center justify-between mb-4 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-6">
          
          <div className="flex">
            <button
              onClick={() => setActiveToggle('actual')}
              className={`flex items-center justify-center px-1 pb-3 pt-2 mr-6 rounded-none border-b-2 cursor-pointer text-[15px] transition-all duration-300 ease-in-out ${activeToggle === 'actual' ? 'border-b-[#09090B] text-[#09090B] font-semibold' : 'border-b-transparent text-[#A1A1AA] font-medium hover:text-gray-700'}`}
            >
              Actual
              {/* Plain text numbers matching image_ae37dd.png */}
              <span className={`ml-2 font-normal ${activeToggle === 'actual' ? 'text-[#71717A]' : 'text-[#A1A1AA]'}`}>
                {formatNumber(actualCount)}
              </span>
            </button>
            
            <button
              onClick={() => setActiveToggle('new')}
              className={`flex items-center justify-center px-1 pb-3 pt-2 rounded-none border-b-2 cursor-pointer text-[15px] transition-all duration-300 ease-in-out ${activeToggle === 'new' ? 'border-b-[#09090B] text-[#09090B] font-semibold' : 'border-b-transparent text-[#A1A1AA] font-medium hover:text-gray-700'}`}
            >
              New
              <span className={`ml-2 font-normal ${activeToggle === 'new' ? 'text-[#71717A]' : 'text-[#A1A1AA]'}`}>
                {formatNumber(newCount)}
              </span>
            </button>
          </div>

          {/* EXACT 160x36 Figma Dropdown using Native HTML to eliminate hover flash */}
          <div className="relative w-[160px] h-[36px] mb-1.5">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="appearance-none w-full h-full bg-white border border-[#E4E4E7] rounded-lg pl-3 pr-8 text-[14px] font-medium text-[#09090B] focus:outline-none hover:bg-zinc-50 cursor-pointer transition-colors"
            >
              <option value="all">All Issues</option>
              <option value="important">Important</option>
              <option value="paused">Paused</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#71717A]">
              <ChevronUpDownIcon className="size-4" />
            </div>
          </div>

        </div>
        
        <Button outline className="flex items-center gap-2 !text-black border !border-[#e4e4e7] shadow-sm mb-1.5 h-[36px]">
          <ArrowDownTrayIcon className="size-4" />
          Export All Issues
        </Button>
      </div>

      {/* 4. Categorized Issues Table */}
      <div className="bg-white rounded-md shadow-sm border border-[#e4e4e7] overflow-hidden mt-2">
        <Table className="w-full">
          <TableHead>
            <TableRow className="!bg-[#FAFAFA] text-zinc-950 text-left text-[13px] font-semibold border-b border-[#e4e4e7]">
              <TableHeader className="w-[45%] border-r border-[#e4e4e7] !pl-4 py-3">Issues</TableHeader>
              <TableHeader className="border-r border-[#e4e4e7]">Crawled</TableHeader>
              <TableHeader className="border-r border-[#e4e4e7]">Changes</TableHeader>
              <TableHeader className="border-r border-[#e4e4e7]">Added</TableHeader>
              <TableHeader className="border-r border-[#e4e4e7]">New</TableHeader>
              <TableHeader className="border-r border-[#e4e4e7]">Removed</TableHeader>
              <TableHeader className="text-center"><span className="sr-only">Actions</span></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            
            {filteredIssues.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-semibold text-gray-900 mb-1">No issues match your filter.</span>
                    <span className="text-sm">Try changing the filter or run a new crawl.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {paginatedGroupedIssues.map((group) => (
              <Fragment key={`${group.key}-group`}>
                
                {/* Category Header Row */}
                <TableRow key={`${group.key}-header`}>
                  <TableCell colSpan={7} className={`${group.section.bg} text-xs font-semibold uppercase tracking-wide ${group.section.text} border-y border-[#E4E4E7] py-2.5 px-4`}>
                    {group.section.label}
                  </TableCell>
                </TableRow>
                
                {/* Issues within the Category */}
                {group.items.map((issue) => {
                  const crawled = issue.crawledCount ?? issue.count ?? 0;
                  const changes = issue.changes ?? 0;
                  const added = issue.added ?? 0;
                  const isNew = issue.new ?? 0; 
                  const removed = issue.removed ?? 0;

                  return (
                    <TableRow key={issue.id} className="hover:bg-zinc-50 transition-colors border-b border-gray-100 last:border-b-0">
                      <TableCell className="font-medium text-zinc-950 border-r border-[#E4E4E7] py-3 pl-4">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(issue.severity)}
                          <span className="font-bold text-[13px]">{issue.name || issue.title}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="border-r border-[#E4E4E7] text-[13px] font-bold text-zinc-900">
                        {formatNumber(crawled)}
                      </TableCell>
                      
                      <TableCell className="border-r border-[#E4E4E7] text-[13px] font-bold">
                         {changes > 0 ? <span className="text-red-500">{changes} ▲</span> : 
                          changes < 0 ? <span className="text-green-500">{Math.abs(changes)} ▼</span> : 
                          <span className="text-zinc-400">0</span>}
                      </TableCell>
                      
                      <TableCell className="border-r border-[#E4E4E7] text-[13px] font-bold text-zinc-400">
                        {added > 0 ? <span className="text-zinc-900">{added}</span> : '0'}
                      </TableCell>
                      
                      <TableCell className="border-r border-[#E4E4E7] text-[13px] font-bold text-zinc-400">
                        {isNew > 0 ? <span className="text-red-500">{isNew}</span> : '0'}
                      </TableCell>
                      
                      <TableCell className="border-r border-[#E4E4E7] text-[13px] font-bold text-zinc-400">
                        {removed > 0 ? <span className="text-green-500">{removed}</span> : '0'}
                      </TableCell>

                      <TableCell className="text-center pr-2">
                        <Dropdown>
                          <DropdownButton plain className="text-zinc-400 hover:text-zinc-600">
                            <EllipsisHorizontalIcon className="size-5" />
                          </DropdownButton>
                          <DropdownMenu anchor="bottom end">
                            <DropdownItem><DropdownLabel>View details</DropdownLabel></DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {filteredIssues.length > 0 && (
        <div className="mt-4 px-2">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

    </div>
  );
}