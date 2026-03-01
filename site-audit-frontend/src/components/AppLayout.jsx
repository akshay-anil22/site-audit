import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarLayout } from './catalyst-ui/sidebar-layout';
import { Navbar, NavbarSection, NavbarSpacer, NavbarItem } from './catalyst-ui/navbar';
import { Sidebar, SidebarBody, SidebarSection, SidebarItem, SidebarLabel, SidebarFooter } from './catalyst-ui/sidebar';

// The exact solid icons matching your Figma sidebar
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

// Top nav icons (kept outline for contrast against the dark background)
import { SparklesIcon, BellIcon } from '@heroicons/react/24/outline';

export default function AppLayout() {
  const location = useLocation();

  return (
    <>
      {/* 1. TOP NAVBAR */}
      <header className="fixed top-0 inset-x-0 h-[60px] bg-[#18181B] flex items-center px-6 z-50">
        <Navbar>
          <NavbarSection>
            <div className="flex items-center gap-2 mr-4 border-r border-zinc-700 pr-4">
              <div className="h-8 w-10 bg-white text-black rounded flex items-center justify-center font-bold font-mono text-lg tracking-tighter">
                {`<>`}
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <NavbarItem href="/sites" className="!text-gray-400 hover:!text-white !bg-transparent">All Sites</NavbarItem>
              <NavbarItem href="#" className="!text-gray-400 hover:!text-white !bg-transparent">AI Website Builder</NavbarItem>
              <NavbarItem href="#" className="!text-gray-400 hover:!text-white !bg-transparent">Templates</NavbarItem>
              <NavbarItem href="#" className="!text-gray-400 hover:!text-white !bg-transparent">Expert Help</NavbarItem>
              <NavbarItem href="#" className="!text-gray-400 hover:!text-white !bg-transparent">Learn</NavbarItem>
              <NavbarItem href="#" className="!text-gray-400 hover:!text-white !bg-transparent">Admin</NavbarItem>
            </div>
          </NavbarSection>

          <NavbarSpacer />

          <NavbarSection>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/80 rounded border border-zinc-700/50">
              <SparklesIcon className="size-4 text-zinc-400" />
              <span className="text-zinc-300 text-[12px] font-medium">Agency plan (200 AI credit/mo)</span>
            </div>
            
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white text-[12px] font-semibold px-4 py-1.5 rounded transition-colors mx-2">
              Upgrade now
            </button>
            
            <NavbarItem href="#" aria-label="Notifications" className="!p-1 !text-zinc-400 hover:!text-white !bg-transparent">
              <BellIcon className="size-5" />
            </NavbarItem>
            
            <div className="size-7 bg-zinc-600 rounded-full border border-zinc-500 flex items-center justify-center text-[11px] text-white font-bold ml-1 cursor-pointer hover:bg-zinc-500 transition-colors">
              W
            </div>
          </NavbarSection>
        </Navbar>
      </header>

      {/* 2. CATALYST SIDEBAR LAYOUT */}
      <SidebarLayout
        navbar={<Navbar />} 
        sidebar={
          <Sidebar>
            <SidebarBody>
              {/* Single section for perfect, gap-free spacing */}
              <SidebarSection>
                <SidebarItem href="/sites" current={location.pathname.startsWith('/sites')}>
                  <HomeIcon data-slot="icon" className="text-gray-400" />
                  <SidebarLabel className="text-gray-600 font-semibold">All Sites</SidebarLabel>
                </SidebarItem>
                
                <SidebarItem href="/social">
                  <NewspaperIcon data-slot="icon" className="text-gray-400" />
                  <SidebarLabel className="text-gray-600">Social Media</SidebarLabel>
                  <ChevronUpIcon className="ml-auto size-4 text-gray-400" />
                </SidebarItem>
                
                <SidebarItem href="/seo">
                  <MagnifyingGlassCircleIcon data-slot="icon" className="!text-gray-900" />
                  <SidebarLabel className="text-gray-900 font-bold">SEO Audit</SidebarLabel>
                </SidebarItem>
                
                <SidebarItem href="/team">
                  <UsersIcon data-slot="icon" className="text-gray-400" />
                  <SidebarLabel className="text-gray-600">Team</SidebarLabel>
                </SidebarItem>
                
                <SidebarItem href="/domains">
                  <GlobeAltIcon data-slot="icon" className="text-gray-400" />
                  <SidebarLabel className="text-gray-600">Domains</SidebarLabel>
                  <ChevronUpIcon className="ml-auto size-4 text-gray-400" />
                </SidebarItem>
                
                <SidebarItem href="/usage">
                  <ChartBarIcon data-slot="icon" className="text-gray-400" />
                  <SidebarLabel className="text-gray-600">Usage</SidebarLabel>
                </SidebarItem>
                
                <SidebarItem href="/billing">
                  <ShoppingBagIcon data-slot="icon" className="text-gray-400" />
                  <SidebarLabel className="text-gray-600">Billing & Subscription</SidebarLabel>
                </SidebarItem>
                
                <SidebarItem href="/settings">
                  <Cog6ToothIcon data-slot="icon" className="text-gray-400" />
                  <SidebarLabel className="text-gray-600">Settings</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            </SidebarBody>
            
            <SidebarFooter className="border-t border-gray-100 p-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-[13px] text-gray-900">AI Credits</span>
                   <span className="text-[11px] text-gray-500 font-medium">78% used</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                   <div className="h-full bg-indigo-600 w-[78%]"></div>
                 </div>
                 <button className="w-full py-1.5 bg-[#18181b] hover:bg-black text-white text-[12px] font-semibold rounded-lg transition-colors">
                   Add more AI credits
                 </button>
              </div>
              <SidebarItem href="#">
                <div className="size-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold mr-2">W</div>
                <SidebarLabel className="text-gray-700 font-bold text-[13px]">{`{workspace 1}`}</SidebarLabel>
              </SidebarItem>
            </SidebarFooter>
          </Sidebar>
        }
      >
        <Outlet />
      </SidebarLayout>
    </>
  );
}