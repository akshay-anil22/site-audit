import React, { useMemo, useState, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sitesApi } from '../api/client';

import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownLabel } from '../components/catalyst-ui/dropdown';
import { Button } from '../components/catalyst-ui/button';

import { HealthScoreCircle } from '../components/catalyst-ui/healthScoreCircle';
import CustomPagination from '../components/catalyst-ui/CustomPagination';

import { 
  GlobeAltIcon, ChevronRightIcon, ChevronDownIcon, 
  PlayIcon, ArrowDownTrayIcon, EllipsisHorizontalIcon,
  ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon,
  ChevronUpDownIcon, StopIcon
} from '@heroicons/react/20/solid';

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

const formatDateTime = (dateString) => {
  if (!dateString) return 'No crawls yet';
  const d = new Date(dateString);
  const datePart = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} ${timePart.replace(' ', '')}`;
};

const calculateChange = (current, previous) => {
  if (previous === undefined || previous === null) return 0;
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
};

const renderChangeBadge = (changeValue, isErrorMetric = false) => {
  if (changeValue === 0 || isNaN(changeValue)) {
    return (
      <div className="flex items-center gap-0.5 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[12px] font-semibold tracking-wide">
        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        0%
      </div>
    );
  }
  
  const isPositive = changeValue > 0;
  const isGood = isErrorMetric ? !isPositive : isPositive; 
  
  const colorClass = isGood ? 'bg-[#ECFCCB] text-[#166534]' : 'bg-red-50 text-red-600';
  const iconPath = isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3";

  return (
    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[12px] font-semibold tracking-wide ${colorClass}`}>
      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
      {Math.abs(changeValue)}%
    </div>
  );
};

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

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'important') {
        return issue.severity === 'error' || issue.impact === 'high';
      }
      return issue.status === statusFilter;
    });
  }, [issues, statusFilter]);

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

  const flatIssues = useMemo(() => {
    return allGroupedIssues.flatMap((group) =>
      group.items.map((item) => ({ ...item, _sectionKey: group.key }))
    );
  }, [allGroupedIssues]);

  const totalItems = flatIssues.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

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
  
  const displayDate = details.startedAt || details.lastCrawl || new Date().toISOString();
  const prevHealthScore = details.previousHealthScore ?? Math.max(0, healthScore - 23); 
  const prevUrlsCrawled = details.previousUrlsCrawled ?? details.urlsCrawled; 
  const prevErrorsCount = details.previousErrorsCount ?? Math.max(0, errorsCount - 84);

  const healthChange = calculateChange(healthScore, prevHealthScore);
  const urlsChange = calculateChange(details.urlsCrawled || 0, prevUrlsCrawled);
  const errorsChange = calculateChange(errorsCount, prevErrorsCount);

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
    <div className="px-2 sm:px-6 pt-3 pb-6 bg-white min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <button onClick={() => navigate('/sites')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <GlobeAltIcon className="size-5" />
            
          </button>
          <ChevronRightIcon className="size-4 text-gray-400" />
          <span className="text-lg tracking-tight">{displayTitle}</span>
          
          {details.status === 'crawling' && (
             <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 animate-pulse">
               Crawling in progress...
             </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 tracking-wide">
            {formatDateTime(displayDate)} <ChevronDownIcon className="size-4 text-gray-400" />
          </button>
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            Compare with <ChevronDownIcon className="size-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-[12px] sm:text-[13px] font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
            <span className="hidden sm:inline">Fix all errors using AI</span>
            <span className="sm:hidden">Fix with AI</span>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-5">
        <div className="p-2.5 sm:p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col items-center">
          <div className="flex w-full justify-between items-start mb-2">
            <h3 className="font-bold text-[12px] sm:text-[14px] text-gray-900">Health score</h3>
            {renderChangeBadge(healthChange, false)}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-2">
            <HealthScoreCircle 
              score={Number.isFinite(healthScore) ? healthScore : 0} 
              size={80} 
              strokeWidth={10} 
            />
          </div>
        </div>

        <div className="p-2.5 sm:p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-[12px] sm:text-[14px] text-gray-900">URLs crawled</h3>
            {renderChangeBadge(urlsChange, false)}
          </div>
          <div className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-900 mb-2 sm:mb-4">
            {formatNumber(details.urlsCrawled)}
          </div>
          <div className="mt-auto space-y-2 text-[11px] sm:text-[13px] font-medium">
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

        <div className="p-2.5 sm:p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-[12px] sm:text-[14px] text-gray-900">Pages errors</h3>
            {renderChangeBadge(errorsChange, true)}
          </div>
          <div className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-900 mb-2 sm:mb-4">
            {formatNumber(errorsCount)}
          </div>
          <div className="mt-auto space-y-2 text-[11px] sm:text-[13px] font-medium">
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

        <div className="p-2.5 sm:p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col">
          <h3 className="font-bold text-[12px] sm:text-[14px] text-gray-900 mb-2 sm:mb-4">Issues distribution</h3>
          <div className="mt-auto space-y-1.5 sm:space-y-2 text-[11px] sm:text-[13px] font-medium">
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

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4 border-b border-[#E4E4E7] gap-2">
        <div className="flex items-center gap-2 sm:gap-6">
          
          <div className="flex">
            <button
              onClick={() => setActiveToggle('actual')}
              className={`flex items-center justify-center px-1 pb-3 pt-2 mr-6 rounded-none border-b-2 cursor-pointer text-[15px] transition-all duration-300 ease-in-out ${activeToggle === 'actual' ? 'border-b-[#09090B] text-[#09090B] font-semibold' : 'border-b-transparent text-[#A1A1AA] font-medium hover:text-gray-700'}`}
            >
              Actual
              <span className="ml-2 inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 py-1 rounded-md bg-[#F4F4F5] text-xs font-medium text-zinc-700">
                {formatNumber(actualCount)}
              </span>
            </button>
            
            <button
              onClick={() => setActiveToggle('new')}
              className={`flex items-center justify-center px-1 pb-3 pt-2 rounded-none border-b-2 cursor-pointer text-[15px] transition-all duration-300 ease-in-out ${activeToggle === 'new' ? 'border-b-[#09090B] text-[#09090B] font-semibold' : 'border-b-transparent text-[#A1A1AA] font-medium hover:text-gray-700'}`}
            >
              New
              <span className="ml-2 inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 py-1 rounded-md bg-[#F4F4F5] text-xs font-medium text-zinc-700">
                {formatNumber(newCount)}
              </span>
            </button>
          </div>

          <div className="relative w-[130px] sm:w-[160px] h-[36px] mb-1.5">
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
        
        <Button outline className="flex items-center gap-2 !text-black border !border-[#e4e4e7] shadow-sm mb-1.5 h-[36px] w-full sm:w-auto justify-center sm:justify-start">
          <ArrowDownTrayIcon className="size-4" />
          Export All Issues
        </Button>
      </div>

      <div className="border border-[#E4E4E7] rounded-[2px] overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-[13px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <th className="w-[44%] px-4 py-3 font-semibold text-zinc-950 border-r border-[#E4E4E7]">Issues</th>
              <th className="w-[10%] px-4 py-3 font-semibold text-zinc-950 border-r border-[#E4E4E7] text-left">Crawled</th>
              <th className="w-[10%] px-4 py-3 font-semibold text-zinc-950 border-r border-[#E4E4E7] text-left">Changes</th>
              <th className="w-[10%] px-4 py-3 font-semibold text-zinc-950 border-r border-[#E4E4E7] text-left">Added</th>
              <th className="w-[10%] px-4 py-3 font-semibold text-zinc-950 border-r border-[#E4E4E7] text-left">New</th>
              <th className="w-[10%] px-4 py-3 font-semibold text-zinc-950 border-r border-[#E4E4E7] text-left">Removed</th>
              <th className="w-[6%] px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>

            {filteredIssues.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-semibold text-gray-900 mb-1">No issues match your filter.</span>
                    <span className="text-sm">Try changing the filter or run a new crawl.</span>
                  </div>
                </td>
              </tr>
            )}

            {paginatedGroupedIssues.map((group) => (
              <Fragment key={`${group.key}-group`}>
                <tr key={`${group.key}-header`} className="border-y border-[#E4E4E7]">
                  <td colSpan={7} className="bg-[#A1A1AA] px-4 py-2.5 text-xs font-semibold text-[#09090B]">
                    {group.section.label}
                  </td>
                </tr>
                {group.items.map((issue) => {
                  const crawled = issue.crawledCount ?? issue.count ?? 0;
                  const changes = issue.changes ?? 0;
                  const added = issue.added ?? 0;
                  const isNew = issue.new ?? 0;
                  const removed = issue.removed ?? 0;

                  return (
                    <tr key={issue.id} className="border-b border-[#E4E4E7] last:border-b-0 hover:bg-zinc-50 transition-colors" style={{ height: '40px', minHeight: '28px' }}>
                      <td className="px-4 py-2.5 border-r border-[#E4E4E7] font-medium text-zinc-950">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(issue.severity)}
                          <span className="font-semibold text-[13px]">{issue.name || issue.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 border-r border-[#E4E4E7] font-bold text-zinc-900">
                        {crawled > 0 ? formatNumber(crawled) : ''}
                      </td>
                      <td className="px-4 py-2.5 border-r border-[#E4E4E7] font-bold">
                        {changes > 0 ? <span className="text-red-500">{changes} ▲</span> :
                         changes < 0 ? <span className="text-green-500">{Math.abs(changes)} ▼</span> :
                         <span className="text-zinc-300">0</span>}
                      </td>
                      <td className="px-4 py-2.5 border-r border-[#E4E4E7] font-bold">
                        {added > 0 ? <span className="text-zinc-900">{added}</span> : <span className="text-zinc-300">0</span>}
                      </td>
                      <td className="px-4 py-2.5 border-r border-[#E4E4E7] font-bold">
                        {isNew > 0 ? <span className="text-red-500">{isNew}</span> : <span className="text-zinc-300">0</span>}
                      </td>
                      <td className="px-4 py-2.5 border-r border-[#E4E4E7] font-bold">
                        {removed > 0 ? <span className="text-green-500">{removed}</span> : <span className="text-zinc-300">0</span>}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <Dropdown>
                          <DropdownButton plain className="text-zinc-400 hover:text-zinc-600">
                            <EllipsisHorizontalIcon className="size-5" />
                          </DropdownButton>
                          <DropdownMenu anchor="bottom end">
                            <DropdownItem><DropdownLabel>View details</DropdownLabel></DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
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