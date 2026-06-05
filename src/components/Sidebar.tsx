/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Layers,
  Globe,
  Workflow,
  Settings,
  Cpu,
  RefreshCw,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  CheckCircle,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { BrowserProfile } from '../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  profiles: BrowserProfile[];
  isWarmingActive: boolean;
  onRefreshStats: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  profiles,
  isWarmingActive,
  onRefreshStats
}) => {
  const totalCount = profiles.length;
  const runningCount = profiles.filter(p => p.status === 'running').length;
  const errorCount = profiles.filter(p => p.status === 'error').length;
  const proxyCount = profiles.filter(p => p.proxy.type !== 'direct').length;
  
  const totalCookies = profiles.reduce((sum, p) => sum + p.cookiesCount, 0);
  
  // Simulated hardware use based on running count
  const cpuUsage = Math.min(12 + runningCount * 14 + (totalCount * 0.5), 98).toFixed(0);
  const ramUsage = (1.8 + runningCount * 0.95 + (totalCount * 0.05)).toFixed(1);

  // Collapsible logic
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem('cdpm_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem('cdpm_sidebar_collapsed', String(nextVal));
  };

  const navItems = [
    {
      id: 'profiles',
      label: 'Quản lý Profiles',
      icon: <Layers className="w-4 h-4" />,
      badge: totalCount > 0 ? totalCount : undefined,
      color: 'text-slate-700'
    },
    {
      id: 'proxies',
      label: 'Cấu hình Proxy',
      icon: <Globe className="w-4 h-4" />,
      badge: proxyCount > 0 ? proxyCount : undefined,
      color: 'text-sky-600'
    },
    {
      id: 'automation',
      label: 'Kịch bản Automation',
      icon: <Workflow className="w-4 h-4" />,
      badge: isWarmingActive ? 'Active' : undefined,
      isBadgePulse: isWarmingActive,
      color: 'text-emerald-600'
    },
    {
      id: 'settings',
      label: 'Hệ thống & Nhóm',
      icon: <Settings className="w-4 h-4" />,
      color: 'text-purple-600'
    }
  ];

  if (isCollapsed) {
    return (
      <aside className="w-16 border-r border-slate-200 bg-white flex flex-col items-center py-4 shrink-0 text-slate-700 select-none font-sans transition-all duration-300">
        {/* Toggle Expand Button at top */}
        <div className="mb-6">
          <button
            onClick={handleToggleCollapse}
            title="Mở rộng menu"
            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500 hover:text-slate-900 cursor-pointer shadow-sm border border-slate-100 bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu (Collapsed Icons) */}
        <div className="flex flex-col gap-2 w-full px-2 items-center flex-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                title={item.label}
                className={`relative p-3 rounded-xl transition-all cursor-pointer group flex items-center justify-center ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-sm' 
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className={isActive ? 'scale-110 transition-transform' : ''}>
                  {item.icon}
                </span>
                
                {/* Active Indicator or Badge */}
                {item.badge && (
                  <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                    item.id === 'automation' ? 'bg-emerald-500' : 'bg-slate-400'
                  } ${item.isBadgePulse ? 'animate-ping' : ''}`} />
                )}
              </button>
            );
          })}

          <div className="w-8 h-[1px] bg-slate-100 my-4" />

          {/* Quick Hardware Resources Info */}
          <div className="flex flex-col items-center gap-4 w-full px-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 w-full text-center">Tải</span>
            
            {/* CPU */}
            <div 
              className="flex flex-col items-center justify-center p-1.5 w-full rounded hover:bg-slate-50 text-slate-600 group cursor-default"
              title={`CPU Giả lập: ${cpuUsage}%`}
            >
              <Cpu className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[9px] font-mono font-black text-emerald-700 bg-emerald-50 rounded px-1">{cpuUsage}%</span>
            </div>

            {/* RAM */}
            <div 
              className="flex flex-col items-center justify-center p-1.5 w-full rounded hover:bg-slate-50 text-slate-600 group cursor-default"
              title={`RAM: ${ramUsage} GB / 16 GB`}
            >
              <FolderOpen className="w-4 h-4 text-sky-600 mb-1" />
              <span className="text-[9px] font-mono font-black text-sky-700 bg-sky-50 rounded px-1">{ramUsage}G</span>
            </div>

            {/* Cookies indicator */}
            <div 
              className="flex flex-col items-center justify-center p-1.5 w-full rounded hover:bg-slate-50 text-slate-600 group cursor-default"
              title={`Lưu trữ cookie: ${totalCookies.toLocaleString()} items`}
            >
              <Database className="w-4 h-4 text-purple-600 mb-1" />
              <span className="text-[9px] font-mono font-black text-purple-700 bg-purple-50 rounded px-1">
                {totalCookies >= 1000 ? `${(totalCookies/1000).toFixed(0)}k` : totalCookies}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-2 mt-auto pt-4">
          <button
            onClick={onRefreshStats}
            title="Đồng bộ hệ thống"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 text-slate-700 select-none font-sans transition-all duration-300">
      {/* Header Panel with Collapse Button */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-slate-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">Menu Hệ Thống</span>
        </div>
        <button 
          onClick={handleToggleCollapse}
          title="Thu nhỏ menu" 
          className="p-1 hover:bg-slate-200 rounded transition text-slate-400 hover:text-slate-800 cursor-pointer"
          id="sidebar-toggle-btn"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation Menu */}
      <div className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto">
        <span className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Danh mục chính</span>
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-xs transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'hover:bg-slate-50 text-slate-650 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : item.color}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </span>
              
              {item.badge !== undefined && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold leading-none ${
                  isActive 
                    ? 'bg-slate-700 text-slate-200' 
                    : item.id === 'automation'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse font-sans font-extrabold'
                      : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="h-[1px] bg-slate-100 my-4" />

        {/* Running Profiles Mini Dashboard in Sidebar */}
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150/60 font-sans space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-600" /> Monitor tài nguyên mạo danh
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs">
              <p className="text-[9px] text-slate-400 font-bold">ĐANG LIVESTREAM</p>
              <p className="text-sm font-black text-emerald-700 font-mono mt-0.5">{runningCount}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs">
              <p className="text-[9px] text-slate-400 font-bold">MẤT KẾT NỐI</p>
              <p className="text-sm font-black text-rose-600 font-mono mt-0.5">{errorCount}</p>
            </div>
          </div>

          {/* Quick Hardware Resource Progress Bars */}
          <div className="space-y-2 pt-1 text-[10px]">
            <div>
              <div className="flex justify-between text-slate-555 mb-0.5 text-slate-500 font-bold">
                <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5 text-emerald-600" /> Tải CPU Giả Lập</span>
                <span className="font-mono">{cpuUsage}%</span>
              </div>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    Number(cpuUsage) > 80 ? 'bg-rose-600' : Number(cpuUsage) > 50 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${cpuUsage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 mb-0.5 font-bold animate-fadeIn">
                <span className="flex items-center gap-1"><FolderOpen className="w-2.5 h-2.5 text-sky-600" /> Virtual Web RAM</span>
                <span className="font-mono">{ramUsage} GB</span>
              </div>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(Number(ramUsage) / 16) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Meta */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2 text-xs">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400 font-medium">Lưu trữ Cookie:</span>
          <span className="font-mono font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.2 rounded">{totalCookies.toLocaleString()} items</span>
        </div>
        <button
          onClick={onRefreshStats}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
        >
          <RefreshCw className="w-3 h-3 text-slate-500" />
          <span>Làm mới bộ nhớ đệm</span>
        </button>
      </div>
    </aside>
  );
};
