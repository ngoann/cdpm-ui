/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Square,
  Edit2,
  Trash2,
  Copy,
  Clock,
  Shield,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  Check,
  AlertCircle,
  HelpCircle,
  HardDrive,
  User,
  MoreVertical,
  Globe,
  CornerDownRight
} from 'lucide-react';
import { BrowserProfile, ProfileStatus } from '../types';
import { formatProxy } from '../utils/browserInfo';

interface ProfileTableProps {
  filteredProfiles: BrowserProfile[];
  
  // Selection
  selectedIds: string[];
  toggleSelectProfile: (id: string) => void;
  toggleSelectAll: () => void;
  
  // Operations
  onLaunch: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (id: string) => void;
  onTestProxy: (id: string) => void;
  
  // Sorting
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;

  // Global triggers
  proxyTestLoadingId: string | null;
}

export const ProfileTable: React.FC<ProfileTableProps> = ({
  filteredProfiles,
  selectedIds,
  toggleSelectProfile,
  toggleSelectAll,
  onLaunch,
  onStop,
  onDelete,
  onDuplicate,
  onEdit,
  onTestProxy,
  sortField,
  sortDirection,
  onSort,
  proxyTestLoadingId
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Platform icon helper
  const getPlatformIcon = (platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios') => {
    switch (platform) {
      case 'windows':
        return <Laptop className="w-3.5 h-3.5 text-blue-650 text-blue-650" title="Windows" />;
      case 'macos':
        return <Laptop className="w-3.5 h-3.5 text-slate-605 text-slate-600" title="macOS" />;
      case 'linux':
        return <Laptop className="w-3.5 h-3.5 text-amber-600" title="Linux" />;
      case 'android':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600" title="Android" />;
      case 'ios':
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" title="iOS" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Status badge styling
  const renderStatusBadge = (profile: BrowserProfile) => {
    const { status, statusMessage, isRunningForMs, pid, port } = profile;

    // Helper to format ms to readable string: MM:SS
    const formatDuration = (ms: number | undefined) => {
      if (!ms) return '00:00';
      const totalSecs = Math.floor(ms / 1000);
      const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
      const secs = (totalSecs % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    };

    switch (status) {
      case 'running':
        return (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 border border-emerald-250 text-emerald-700 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ĐANG CHẠY</span>
            </span>
            {pid && (
              <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-x-2 items-center leading-none">
                <span className="bg-slate-100 border border-slate-200 px-1 py-0.2 rounded" title="Process ID">PID: {pid}</span>
                <span className="bg-slate-100 border border-slate-200 px-1 py-0.2 rounded" title="Debugging Port">Port: {port}</span>
                <span className="text-emerald-600 font-bold">{formatDuration(isRunningForMs)}</span>
              </div>
            )}
          </div>
        );
      case 'starting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-700 w-fit">
            <Loader2 className="w-3 h-3 animate-spin text-amber-650" />
            <span>ĐANG KHỞI ĐỘNG...</span>
          </span>
        );
      case 'stopping':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-600 w-fit">
            <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
            <span>ĐANG DỪNG...</span>
          </span>
        );
      case 'error':
        return (
          <div className="flex flex-col gap-0.5 max-w-[200px]">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 w-fit">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>LỖI VẬN HÀNH</span>
            </span>
            <span className="text-[10px] text-rose-600 line-clamp-2 leading-tight font-medium" title={statusMessage}>
              {statusMessage || 'Có lỗi phát sinh'}
            </span>
          </div>
        );
      case 'stopped':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-500 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>ĐÃ DỪNG</span>
          </span>
        );
    }
  };

  // Safe formatting without exposing plain text passwords
  const renderProxyCell = (profile: BrowserProfile) => {
    const { proxy } = profile;
    if (proxy.type === 'direct') {
      return (
        <div className="flex items-center gap-1.5 text-slate-455 text-slate-500 text-[11px]">
          <Globe className="w-3 h-3 shrink-0" />
          <span>Direct (Mạng thật)</span>
        </div>
      );
    }

    const hostString = `${proxy.host}:${proxy.port}`;
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-slate-800 text-xs font-mono">
          <span className="text-[10px] font-sans font-bold bg-slate-100 text-slate-700 px-1 py-0.2 rounded scale-95 shrink-0 border border-slate-200">
            {proxy.type.toUpperCase()}
          </span>
          <span className="truncate max-w-[150px] font-semibold text-slate-700" title={hostString}>{hostString}</span>
        </div>
        {proxy.username && (
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <span>user:</span>
            <span className="text-slate-600 font-mono font-medium">{proxy.username}</span>
            <span className="text-slate-400 font-mono">| pass:••••••</span>
          </p>
        )}
      </div>
    );
  };

  // Last launch time in Vietnamese
  const renderLastLaunch = (isoString?: string) => {
    if (!isoString) return <span className="text-slate-400">-</span>;
    const date = new Date(isoString);
    return (
      <span className="text-slate-550 text-slate-500 text-xs font-mono" title={date.toLocaleString('vi-VN')}>
        {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{" "}
        {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
      </span>
    );
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ▴' : ' ▾';
  };

  const hasCheckedAll = filteredProfiles.length > 0 && selectedIds.length === filteredProfiles.length;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden font-sans">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold tracking-wider select-none">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={hasCheckedAll}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                  title="Chọn tất cả"
                />
              </th>
              
              <th 
                onClick={() => onSort('name')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap text-[11px] font-bold"
              >
                TÊN PROFILE & USER-AGENT {getSortIcon('name')}
              </th>

              <th 
                onClick={() => onSort('group')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap text-[11px] font-bold"
              >
                NHÓM (GROUP) {getSortIcon('group')}
              </th>

              <th className="py-3.5 px-4 text-[11px] font-bold">CẤU HÌNH PROXY & CHỨNG THỰC</th>
              
              <th className="py-3.5 px-4 text-[11px] font-bold max-w-[200px]">VÂN TAY VÀ THIẾT BIÊN</th>

              <th 
                onClick={() => onSort('status')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap text-[11px] font-bold"
              >
                TRẠNG THÁI CUỘC GỌI {getSortIcon('status')}
              </th>

              <th className="py-3.5 px-4 text-[11px] font-bold">THẺ PHÂN LOẠI</th>

              <th 
                onClick={() => onSort('diskSize')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap text-[11px] font-bold text-right"
              >
                BỘ NHỚ / COOKIES {getSortIcon('diskSize')}
              </th>

              <th className="py-3.5 px-4 text-center w-40 text-[11px] font-bold">HÀNH ĐỘNG HỆ THỐNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-450 bg-slate-50/20">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="bg-slate-50 p-3.5 rounded-full border border-slate-200">
                      <HelpCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-sm">Không tìm thấy Profile nào</h3>
                    <p className="text-xs text-slate-500 leading-snug">
                      Vui lòng thử nhập nội dung tìm kiếm khác, đổi bộ lọc nhóm/tag/trạng thái hoặc tạo thêm profile mới để thiết lập kịch bản.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProfiles.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isProxyChecking = proxyTestLoadingId === p.id;
                
                return (
                  <tr
                    key={p.id}
                    onMouseEnter={() => setHoveredRowId(p.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    className={`group hover:bg-slate-50/80 transition duration-150 ${
                      isSelected ? 'bg-slate-100/70 border-l-2 border-l-slate-850 border-l-slate-800' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    {/* Checkbox column */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProfile(p.id)}
                        className="rounded border-slate-300 text-slate-800 focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                      />
                    </td>

                    {/* Name & Fingerprint Header */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(p.fingerprint.platform)}
                          <span 
                            onClick={() => onEdit(p.id)}
                            className="font-bold text-slate-900 hover:text-emerald-600 cursor-pointer text-xs transition truncate max-w-[200px]"
                            title={p.name}
                          >
                            {p.name}
                          </span>
                        </div>
                        {/* Compact user agent */}
                        <div className="text-[10px] text-slate-450 font-mono truncate max-w-[220px]" title={p.fingerprint.userAgent}>
                          {p.fingerprint.userAgent}
                        </div>
                      </div>
                    </td>

                    {/* Group badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-600">
                        {p.group}
                      </span>
                    </td>

                    {/* Proxy Detail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-between gap-2 max-w-[210px]">
                        {renderProxyCell(p)}
                        
                        {p.proxy.type !== 'direct' && (
                          <button
                            onClick={() => onTestProxy(p.id)}
                            disabled={isProxyChecking}
                            className={`p-1 rounded cursor-pointer transition shrink-0 ${
                              isProxyChecking
                                ? 'bg-slate-100'
                                : 'hover:bg-slate-150 text-slate-400 hover:text-sky-600'
                            }`}
                            title="Kiểm thử tốc độ & IP Proxy"
                          >
                            {isProxyChecking ? (
                              <Loader2 className="w-3 h-3 animate-spin text-sky-500" />
                            ) : (
                              <Globe className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Hardware Fingerprint details */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="space-y-0.5 text-[10px] font-mono text-slate-550">
                        <div className="flex items-center gap-1 text-slate-700">
                          <span className="text-[9px] font-sans bg-slate-100 px-1 py-0.2 rounded text-slate-500 shrink-0 border border-slate-200">RES</span>
                          <span className="font-semibold">{p.fingerprint.screenResolution}</span>
                        </div>
                        <div className="text-[10px] text-slate-450 flex flex-wrap gap-x-2 items-center">
                          <span>Canvas: <strong className={p.fingerprint.canvasFingerprint === 'noise' ? 'text-emerald-700' : 'text-slate-500'}>{p.fingerprint.canvasFingerprint}</strong></span>
                          <span>WebGL: <strong className={p.fingerprint.webglFingerprint === 'noise' ? 'text-emerald-700' : 'text-slate-500'}>{p.fingerprint.webglFingerprint}</strong></span>
                        </div>
                      </div>
                    </td>

                    {/* Status badge with duration counter */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(p)}
                    </td>

                    {/* Tags */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {p.tags.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">Không thẻ</span>
                        ) : (
                          p.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-semibold shrink-0"
                            >
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Cookie amount & file storage size */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-xs">
                      <div className="space-y-0.5 text-right">
                        <div className="text-slate-800 font-semibold flex items-center justify-end gap-1">
                          <HardDrive className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{p.diskSize}</span>
                        </div>
                        <div className="text-[10px] text-slate-450" title="Cookies được lưu lại">
                          {p.cookiesCount} cookies / {formatLastLaunch(p.lastLaunch)}
                        </div>
                      </div>
                    </td>

                    {/* Actions panel */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {p.status === 'running' ? (
                          <button
                            onClick={() => onStop(p.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded cursor-pointer transition border border-rose-200/60"
                            title="Tắt Profile"
                          >
                            <Square className="w-3.5 h-3.5 fill-rose-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onLaunch(p.id)}
                            disabled={p.status === 'starting' || p.status === 'stopping'}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded cursor-pointer transition border border-emerald-200/60 disabled:opacity-40 animate-[fadeIn_0.15s_ease-out]"
                            title="Mở trình duyệt (Launch Browser)"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-600" />
                          </button>
                        )}

                        <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

                        <button
                          onClick={() => onEdit(p.id)}
                          className="hover:bg-slate-100 text-slate-450 hover:text-slate-800 p-1.5 rounded cursor-pointer transition"
                          title="Chỉnh sửa cấu hình"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDuplicate(p.id)}
                          className="hover:bg-slate-100 text-slate-455 hover:text-sky-600 p-1.5 rounded cursor-pointer transition"
                          title="Nhân bản meta profile (Duplicate)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDelete(p.id)}
                          disabled={p.status === 'running'}
                          className="hover:bg-slate-100 text-slate-400 hover:text-rose-600 p-1.5 rounded cursor-pointer transition disabled:opacity-30"
                          title={p.status === 'running' ? 'Cần tắt profile để xóa' : 'Xóa profile vĩnh viễn'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper for relative time text
function formatLastLaunch(iso?: string) {
  if (!iso) return 'chưa dùng';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'vừa xong';
  if (diffMins < 60) return `${diffMins}p trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}g trước`;
  return `${Math.floor(diffHours / 24)}n trước`;
}
