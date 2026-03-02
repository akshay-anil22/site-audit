import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { SidebarLayout } from './catalyst-ui/sidebar-layout';
import { Navbar, NavbarSection, NavbarSpacer, NavbarItem } from './catalyst-ui/navbar';
import { Sidebar, SidebarBody, SidebarSection, SidebarItem, SidebarLabel, SidebarFooter } from './catalyst-ui/sidebar';

import {
  HomeIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  MagnifyingGlassCircleIcon,
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  NewspaperIcon,
  ChevronUpIcon
} from '@heroicons/react/20/solid';

import { SparklesIcon, BellIcon } from '@heroicons/react/24/outline';

export default function AppLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const getNavClass = (path, extraPaths = []) => {
    const active = isActive(path) || extraPaths.some(p => isActive(p));
    return `flex items-center h-full px-2 text-[14px] transition-all duration-200 ${
      active 
        ? 'text-white font-semibold underline underline-offset-[6px] decoration-2 decoration-zinc-500' 
        : 'text-gray-400 font-medium hover:text-white no-underline'
    }`;
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-[60px] bg-[#18181B] flex items-center px-3 sm:px-6 z-50">
        <Navbar className="h-full">
          <NavbarSection className="h-full">
            <img src="/codedesign.svg" alt="Logo" className="h-9 w-auto" />
            <div className="h-13 w-[1.2px] bg-[#3F3F46] ml-1 mr-1" aria-hidden="true" />
            
            <div className="hidden md:flex items-center gap-4 h-full ml-4">
              <Link to="/sites" className={getNavClass('/sites', ['/crawls'])}>
                All Sites
              </Link>
              <Link to="/builder" className={getNavClass('/builder')}>
                AI Website Builder
              </Link>
              <Link to="/templates" className={getNavClass('/templates')}>
                Templates
              </Link>
              <Link to="/help" className={getNavClass('/help')}>
                Expert Help
              </Link>
              <Link to="/learn" className={getNavClass('/learn')}>
                Learn
              </Link>
              <Link to="/admin" className={getNavClass('/admin')}>
                Admin
              </Link>
            </div>
          </NavbarSection>

          <NavbarSpacer />

          <NavbarSection>
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-transparent rounded-md border border-zinc-600 mr-1">
              <SparklesIcon className="size-4 text-zinc-300" />
              <span className="text-zinc-200 text-[12px] font-medium">Agency plan (200 AI credit/mo)</span>
            </div>
            
            <button className="hidden sm:block bg-zinc-600 hover:bg-zinc-500 text-white text-[13px] font-bold px-4 py-1.5 rounded-md transition-colors">
              Upgrade now
            </button>
            
            <NavbarItem href="#" aria-label="Notifications" className="!p-1.5 !text-zinc-400 hover:!text-white !bg-transparent">
              <BellIcon className="size-5" />
            </NavbarItem>
            
            <div className="size-8 rounded-full overflow-hidden border-2 border-zinc-500 ml-1 cursor-pointer flex-shrink-0 bg-zinc-500 flex items-center justify-center text-[12px] text-white font-bold hover:border-zinc-400 transition-colors">
              W
            </div>
          </NavbarSection>
        </Navbar>
      </header>

      <div className="pt-[60px] bg-[#F4F4F5] min-h-screen">
        <SidebarLayout
          sidebar={
            <Sidebar className="!bg-[#F4F4F5] border-r border-[#E4E4E7] w-[256px]">
              <SidebarBody className="pt-4">
                <SidebarSection>
                  <SidebarItem href="/sites" current={isActive('/sites')}>
                    <HomeIcon data-slot="icon" className={isActive('/sites') ? '!fill-[#09090B]' : '!fill-zinc-400'} />
                    <SidebarLabel className={`text-[14px] ${isActive('/sites') ? 'font-bold text-[#09090B]' : 'text-gray-600 font-semibold'}`}>All Sites</SidebarLabel>
                  </SidebarItem>
                  
                  <SidebarItem href="/social">
                    <NewspaperIcon data-slot="icon" className="!fill-zinc-400" />
                    <SidebarLabel className="text-gray-600 text-[14px]">Social Media</SidebarLabel>
                    <ChevronUpIcon className="ml-auto size-4 text-[#A1A1AA]" />
                  </SidebarItem>
                  
                  <SidebarItem href="/seo" current={isActive('/seo') || isActive('/crawls')}>
                    <MagnifyingGlassCircleIcon data-slot="icon" className={isActive('/seo') || isActive('/crawls') ? '!fill-[#09090B]' : '!fill-zinc-400'} />
                    <SidebarLabel className={`text-[14px] ${isActive('/seo') || isActive('/crawls') ? 'font-bold text-[#09090B]' : 'text-gray-600'}`}>SEO Audit</SidebarLabel>
                  </SidebarItem>
                  
                  <SidebarItem href="/team">
                    <UsersIcon data-slot="icon" className="!fill-zinc-400" />
                    <SidebarLabel className="text-gray-600 text-[14px]">Team</SidebarLabel>
                  </SidebarItem>
                  
                  <SidebarItem href="/domains">
                    <GlobeAltIcon data-slot="icon" className="!fill-zinc-400" />
                    <SidebarLabel className="text-gray-600 text-[14px]">Domains</SidebarLabel>
                    <ChevronUpIcon className="ml-auto size-4 text-[#A1A1AA]" />
                  </SidebarItem>
                  
                  <SidebarItem href="/usage">
                    <ChartBarIcon data-slot="icon" className="!fill-zinc-400" />
                    <SidebarLabel className="text-gray-600 text-[14px]">Usage</SidebarLabel>
                  </SidebarItem>
                  
                  <SidebarItem href="/billing">
                    <ShoppingBagIcon data-slot="icon" className="!fill-zinc-400" />
                    <SidebarLabel className="text-gray-600 text-[14px]">Billing & Subscription</SidebarLabel>
                  </SidebarItem>
                  
                  <SidebarItem href="/settings">
                    <Cog6ToothIcon data-slot="icon" className="!fill-zinc-400" />
                    <SidebarLabel className="text-gray-600 text-[14px]">Settings</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </SidebarBody>
              
              <SidebarFooter className="p-4 pb-6 mt-auto">
                <div className="bg-white p-4 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#E4E4E7] mb-3">
                   <div className="flex justify-between items-center mb-3">
                     <span className="font-bold text-[13px] text-[#09090B]">AI Credits</span>
                     <span className="text-[12px] text-[#71717A] font-medium">78% used</span>
                   </div>
                   <div className="h-1.5 w-full bg-[#F4F4F5] rounded-full overflow-hidden mb-4">
                     <div className="h-full bg-[#4F46E5] w-[78%] rounded-full"></div>
                   </div>
                   <button className="w-full py-2 bg-[#09090B] hover:bg-[#27272A] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                     Add more AI credits
                   </button>
                </div>
                
                <div className="border-t border-[#E4E4E7] my-2" />
                <SidebarItem href="#" className="py-2">
                  <div className="size-6 bg-[#09090B] text-white rounded-full flex items-center justify-center text-[10px] font-bold mr-1">W</div>
                  <SidebarLabel className="text-[#71717A] font-medium text-[14px]">{`{workspace 1}`}</SidebarLabel>
                  <ChevronUpIcon className="ml-auto size-4 text-[#A1A1AA]" />
                </SidebarItem>
              </SidebarFooter>
            </Sidebar>
          }
        >
          <Outlet />
        </SidebarLayout>
      </div>
    </>
  );
}