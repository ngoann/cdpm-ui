/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Terminal, 
  RefreshCw, 
  Globe, 
  Play, 
  Square, 
  Trash2, 
  Layers, 
  Tag, 
  Settings, 
  Workflow, 
  PlusCircle, 
  FileJson, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Layers2,
  ListFilter,
  LogOut,
  Upload,
  HardDrive,
  Search,
  Cpu,
  Wifi,
  Sliders,
  Sparkles,
  TrendingUp,
  X,
  Check,
  Database,
  FolderOpen
} from 'lucide-react';

import { BrowserProfile, ProxyConfig, ActivityLog, ProfileStatus } from './types';
import { INITIAL_PROFILES, INITIAL_GROUPS, INITIAL_TAGS, MOCK_CHANNELS, MOCK_VIDEOS } from './mockData';
import { generateRandomPID, generateRandomPort, generateRandomSize } from './utils/browserInfo';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { ProfileTable } from './components/ProfileTable';
import { ProfileModal } from './components/ProfileModal';
import { Login } from './components/Login';
import { VideoManager } from './components/VideoManager';

export default function App() {
  // --- Persistent Storage Loading ---
  const [profiles, setProfiles] = useState<BrowserProfile[]>(() => {
    const stored = localStorage.getItem('cdpm_profiles');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BrowserProfile[];
        // Clear running state on init/refresh to keep it consistent
        return parsed.map(p => {
          if (p.status === 'running' || p.status === 'starting' || p.status === 'stopping') {
            return { ...p, status: 'stopped', pid: undefined, port: undefined, isRunningForMs: undefined };
          }
          return p;
        });
      } catch (err) {
        console.error('Lỗi phân tích localStorage profiles:', err);
      }
    }
    return INITIAL_PROFILES;
  });

  const [groups, setGroups] = useState<string[]>(() => {
    const stored = localStorage.getItem('cdpm_groups');
    return stored ? JSON.parse(stored) : INITIAL_GROUPS;
  });

  const [tags, setTags] = useState<string[]>(() => {
    const stored = localStorage.getItem('cdpm_tags');
    return stored ? JSON.parse(stored) : INITIAL_TAGS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const stored = localStorage.getItem('cdpm_logs');
    if (stored) return JSON.parse(stored);
    
    // Default initial audit logs
    const now = new Date();
    return [
      {
        id: 'log-init-1',
        timestamp: now.toLocaleTimeString('vi-VN'),
        profileName: 'Hệ thống',
        type: 'info',
        message: 'Khởi động CD Profile Manager. Nạp thành công database local browser.'
      },
      {
        id: 'log-init-2',
        timestamp: new Date(now.getTime() - 2000).toLocaleTimeString('vi-VN'),
        profileName: 'Hệ thống',
        type: 'success',
        message: 'Kết nối an toàn với nhân Chromium API. Sẵn sàng cấu hình giả lập.'
      }
    ];
  });

  // --- Dynamic UI State ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cdpm_logged_in') === 'true' || sessionStorage.getItem('cdpm_logged_in') === 'true';
  });
  const [loggedUser, setLoggedUser] = useState<string>(() => {
    return localStorage.getItem('cdpm_logged_user') || sessionStorage.getItem('cdpm_logged_user') || 'admin';
  });
  const [activePage, setActivePage] = useState<string>('profiles');
  
  // --- Proxy Page states ---
  const [proxySearchTerm, setProxySearchTerm] = useState('');
  const [proxyRatings, setProxyRatings] = useState<Record<string, { ping: number; status: 'ok' | 'fail' }>>({});
  const [bulkTesting, setBulkTesting] = useState(false);

  // --- Automation Page states ---
  const [selectedWarmProfiles, setSelectedWarmProfiles] = useState<string[]>([]);
  const [warmSites, setWarmSites] = useState<string[]>(['google.com', 'amazon.com', 'shopee.vn']);
  const [scrollSpeed, setScrollSpeed] = useState<number>(45);
  const [sleepDuration, setSleepDuration] = useState<number>(3);

  // --- Settings Page states ---
  const [newGroupName, setNewGroupName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [defaultOS, setDefaultOS] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [defaultResolution, setDefaultResolution] = useState<string>('1920x1080');
  const [profileStoragePath, setProfileStoragePath] = useState<string>(() => {
    return localStorage.getItem('cdpm_profile_storage_path') || 'C:\\CDProfileManager\\profiles_data';
  });
  const [tempStoragePath, setTempStoragePath] = useState<string>(() => {
    return localStorage.getItem('cdpm_profile_storage_path') || 'C:\\CDProfileManager\\profiles_data';
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal control state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BrowserProfile | null>(null);

  // Confirmation state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
  } | null>(null);

  const openConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText = 'Xác nhận xóa'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      },
      confirmText
    });
  };

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Testing individual proxy loading tracker
  const [proxyTestLoadingId, setProxyTestLoadingId] = useState<string | null>(null);

  // Cookie warming automation script state
  const [isWarmingActive, setIsWarmingActive] = useState(false);

  // Batch menu controls
  const [batchActionType, setBatchActionType] = useState<'none' | 'tag' | 'group'>('none');
  const [batchTagValue, setBatchTagValue] = useState('');
  const [batchGroupValue, setBatchGroupValue] = useState('Mặc định');

  // Timer reference for active run duration counter
  const runTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Auth Handlers ---
  const handleLoginSuccess = (user: string) => {
    setIsLoggedIn(true);
    setLoggedUser(user);
    addToast('success', `Chào mừng ${user} trở lại hệ thống!`, 'Đăng nhập thành công');
    addSystemLog('Hệ thống', 'success', `Người dùng "${user}" đăng nhập bảng điều khiển thành công.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('cdpm_logged_in');
    localStorage.removeItem('cdpm_logged_user');
    sessionStorage.removeItem('cdpm_logged_in');
    sessionStorage.removeItem('cdpm_logged_user');
    setIsLoggedIn(false);
    addToast('info', 'Bạn đã đăng xuất khỏi hệ thống thành công.', 'Đăng xuất');
  };

  // --- Save states persistently ---
  useEffect(() => {
    localStorage.setItem('cdpm_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('cdpm_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('cdpm_tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('cdpm_logs', JSON.stringify(logs.slice(0, 100))); // Persist last 100 logs
  }, [logs]);

  // --- Interval: Active Launch-time counters tracker ---
  useEffect(() => {
    runTimerRef.current = setInterval(() => {
      setProfiles(prev => {
        let changed = false;
        const next = prev.map(p => {
          if (p.status === 'running') {
            changed = true;
            return {
              ...p,
              isRunningForMs: (p.isRunningForMs || 0) + 1000
            };
          }
          return p;
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      if (runTimerRef.current) clearInterval(runTimerRef.current);
    };
  }, []);

  // --- Helper: Add Toast Alerts ---
  const addToast = (type: ToastMessage['type'], message: string, title?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      message,
      title
    };
    setToasts(prev => [newToast, ...prev]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Helper: Add Console Log Entries ---
  const addSystemLog = (profileName: string, type: ActivityLog['type'], message: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      profileName,
      type,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- Profile state lifecycle triggers ---
  const handleLaunchProfile = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;

    if (prof.status === 'running' || prof.status === 'starting') {
      addToast('warning', `Profile "${prof.name}" đã hoặc đang chạy rồi.`, 'Cảnh báo trùng lặp');
      return;
    }

    // Set starting state
    setProfiles(prev => prev.map(p => p.id === id ? { 
      ...p, 
      status: 'starting', 
      statusMessage: 'Đang tải môi trường chrome...' 
    } : p));
    
    addSystemLog(prof.name, 'info', `Bắt đầu nạp nhân Chromium giả lập... Hệ điều hành gốc: ${prof.fingerprint.platform.toUpperCase()}`);
    
    // Simulate delay
    setTimeout(() => {
      // Simulate connection checking success rates
      const actsLikeFail = prof.proxy.type !== 'direct' && (prof.proxy.host.toLowerCase().includes('fail') || prof.id === 'prof-3');
      
      if (actsLikeFail) {
        setProfiles(prev => prev.map(p => p.id === id ? {
          ...p,
          status: 'error',
          statusMessage: 'Lỗi Proxy: Kết nối thất bại (Connection Timeout/Proxy Auth Required)'
        } : p));

        addSystemLog(prof.name, 'error', `Không thể thiết lập liên kết SOCKS/HTTP:// ${prof.proxy.host}:${prof.proxy.port}. Tiến trình Chrome bị đình trệ.`);
        addToast('error', `Mở trình duyệt thất bại. Hãy kiểm nghiệm lại Proxy.`, `Lỗi: ${prof.name}`);
      } else {
        const assignedPID = generateRandomPID();
        const assignedPort = generateRandomPort();
        
        setProfiles(prev => prev.map(p => p.id === id ? {
          ...p,
          status: 'running',
          statusMessage: 'Đang chạy',
          lastLaunch: new Date().toISOString(),
          isRunningForMs: 0,
          pid: assignedPID,
          port: assignedPort
        } : p));

        addSystemLog(prof.name, 'success', `Khởi chạy trình duyệt thành công. PID: ${assignedPID} | Bind Port Debugger: localhost:${assignedPort}. Vân tay thiết bị đã tiêm ảo.`);
        addToast('success', `Đã mở cửa sổ trình duyệt ${prof.name}. Đang nạp Cookie.`, 'Khởi chạy thành công');
      }
    }, 1200);
  };

  const handleStopProfile = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;

    // Transitioning state
    setProfiles(prev => prev.map(p => p.id === id ? { 
      ...p, 
      status: 'stopping' 
    } : p));

    addSystemLog(prof.name, 'info', `Đang đóng các cổng socket và lưu trạng thái session...`);

    setTimeout(() => {
      // Randomly increase cookie count slightly as browsers gather local activity logs!
      const randomCookiesGained = Math.floor(Math.random() * 8);
      
      setProfiles(prev => prev.map(p => p.id === id ? {
        ...p,
        status: 'stopped',
        statusMessage: 'Sẵn sàng',
        cookiesCount: p.cookiesCount + randomCookiesGained,
        isRunningForMs: undefined,
        pid: undefined,
        port: undefined
      } : p));

      addSystemLog(prof.name, 'info', `Tiến trình đóng hoàn toàn (Exit code 0). Lưu giữ thành công ${prof.cookiesCount + randomCookiesGained} items cookie.`);
      addToast('info', `Đã tắt đóng cửa sổ của profile "${prof.name}".`, 'Đã dừng trình duyệt');
    }, 800);
  };

  // --- Deletion & Duplication & Saving CRUD ---
  const handleDeleteProfile = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;

    if (prof.status === 'running') {
      addToast('error', 'Cần đóng trình duyệt đang hoạt động trước khi xóa.', 'Xóa bị chặn');
      return;
    }

    openConfirm(
      'Xóa vĩnh viễn Browser Profile?',
      `Bạn có chắc chắn muốn xóa vĩnh viễn Browser Profile "${prof.name}"? Dữ liệu cookie cấu hình của profile này sẽ bị mất toàn bộ.`,
      () => {
        setProfiles(prev => prev.filter(p => p.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        addSystemLog(prof.name, 'warning', `Đã xóa bóc tách profile khỏi cơ sở dữ liệu local.`);
        addToast('success', `Đã xóa thành công profile "${prof.name}".`, 'Thực thi thành công');
      }
    );
  };

  const handleDuplicateProfile = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;

    const newId = `prof-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const duplicated: BrowserProfile = {
      ...prof,
      id: newId,
      name: `${prof.name} - Duplicate`,
      status: 'stopped',
      isRunningForMs: undefined,
      pid: undefined,
      port: undefined,
      diskSize: generateRandomSize(),
      lastLaunch: undefined
    };

    setProfiles(prev => [duplicated, ...prev]);
    addSystemLog(duplicated.name, 'success', `Sao chép metadata vân tay của profile [${prof.name}] thành công.`);
    addToast('success', `Đã tạo bản sao nhân bản của "${prof.name}".`, 'Nhân bản thành công');
  };

  const handleSaveProfile = (formPayload: Partial<BrowserProfile>) => {
    if (editingProfile) {
      // Edit mode
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? {
        ...p,
        ...formPayload,
        fingerprint: {
          ...p.fingerprint,
          ...formPayload.fingerprint
        }
      } as BrowserProfile : p));

      // Append new group to group pool if not present
      if (formPayload.group && !groups.includes(formPayload.group)) {
        setGroups(g => [...g, formPayload.group!]);
      }

      // Append new tags to tag pool
      if (formPayload.tags) {
        setTags(tPool => {
          const added = formPayload.tags!.filter(x => !tPool.includes(x));
          return [...tPool, ...added];
        });
      }

      addSystemLog(formPayload.name || editingProfile.name, 'success', `Cập nhật cấu hình và tham số chống quét chéo thành công.`);
      addToast('success', `Đã cập nhật profile "${formPayload.name}".`, 'Cập nhật thành công');
    } else {
      // Create mode
      const newId = `prof-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newProfile: BrowserProfile = {
        id: newId,
        name: formPayload.name || 'Profile Vô danh',
        group: formPayload.group || 'Mặc định',
        proxy: formPayload.proxy as ProxyConfig || { type: 'direct', host: '', port: 0 },
        tags: formPayload.tags || [],
        status: 'stopped',
        cookiesCount: Math.floor(Math.random() * 20),
        diskSize: "4.8 MB",
        notes: formPayload.notes || '',
        fingerprint: formPayload.fingerprint as any
      };

      setProfiles(prev => [newProfile, ...prev]);

      // Append new group/tags
      if (newProfile.group && !groups.includes(newProfile.group)) {
        setGroups(g => [...g, newProfile.group!]);
      }
      if (newProfile.tags.length > 0) {
        setTags(tPool => {
          const added = newProfile.tags.filter(x => !tPool.includes(x));
          return [...tPool, ...added];
        });
      }

      addSystemLog(newProfile.name, 'success', `Khởi tạo hoàn tất profile mới. Sẵn sàng cấu hình proxy.`);
      addToast('success', `Đã tạo mới thiết lập profile "${newProfile.name}".`, 'Tạo thành công');
    }
    setEditingProfile(null);
  };

  // --- External Single Proxy Test from Rows ---
  const handleTestProxyFromList = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof || prof.proxy.type === 'direct') return;

    setProxyTestLoadingId(id);
    addSystemLog(prof.name, 'info', `Yêu cầu kiểm tra kết nối proxy ngược... Trình kết nối: ${prof.proxy.type.toUpperCase()}://${prof.proxy.host}:${prof.proxy.port}`);

    setTimeout(() => {
      setProxyTestLoadingId(null);
      const isOk = !prof.proxy.host.toLowerCase().includes('fail') && prof.id !== 'prof-3' && Math.random() > 0.15;
      
      if (isOk) {
        const ping = Math.floor(Math.random() * 90 + 20);
        addSystemLog(prof.name, 'success', `Kết nối thông suốt! Ping: ${ping}ms | Gói tin ổn định.`);
        addToast('success', `Proxy ${prof.proxy.host}:${prof.proxy.port} hoạt động. Ping ${ping}ms.`, `Thành công: ${prof.name}`);
      } else {
        addSystemLog(prof.name, 'error', `Khước từ thiết lập: Connection Timeout hoặc thông tin Auth proxy bị gõ sai.`);
        addToast('error', `Proxy mất kết nối hoặc sai tên đăng nhập/mật khẩu.`, `Thất bại: ${prof.name}`);
      }
    }, 1100);
  };

  // --- Proxy Page-specific Testing Handlers ---
  const testProxyWithId = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof || prof.proxy.type === 'direct') return;
    
    setProxyRatings(prev => ({
      ...prev,
      [id]: { ping: 0, status: 'ok' }
    }));

    setTimeout(() => {
      const isOk = !prof.proxy.host.toLowerCase().includes('fail') && prof.id !== 'prof-3' && Math.random() > 0.12;
      if (isOk) {
        const ping = Math.floor(Math.random() * 110 + 25);
        setProxyRatings(prev => ({
          ...prev,
          [id]: { ping, status: 'ok' }
        }));
        addSystemLog(prof.name, 'success', `[Proxy Check] Host: ${prof.proxy.host} | Latency: ${ping}ms | Gói tin OK`);
      } else {
        setProxyRatings(prev => ({
          ...prev,
          [id]: { ping: 0, status: 'fail' }
        }));
        addSystemLog(prof.name, 'error', `[Proxy Check] Host: ${prof.proxy.host} | Lỗi kết nối`);
      }
    }, 800);
  };

  const handleBulkTestProxies = () => {
    const listToTest = profiles.filter(p => p.proxy.type !== 'direct');
    if (listToTest.length === 0) {
      addToast('warning', 'Không có profile nào sài cấu hình proxy để kiểm tra.');
      return;
    }
    setBulkTesting(true);
    addToast('info', `Đang kiểm tra kết nối đồng loạt ${listToTest.length} địa chỉ Proxy...`);
    
    listToTest.forEach((prof, idx) => {
      setTimeout(() => {
        const isOk = !prof.proxy.host.toLowerCase().includes('fail') && prof.id !== 'prof-3' && Math.random() > 0.12;
        const ping = isOk ? Math.floor(Math.random() * 110 + 25) : 0;
        setProxyRatings(prev => ({
          ...prev,
          [prof.id]: { ping, status: isOk ? 'ok' : 'fail' }
        }));
        if (idx === listToTest.length - 1) {
          setBulkTesting(false);
          addToast('success', 'Đã hoàn tất đo lường ping hệ thống.');
        }
      }, idx * 250);
    });
  };

  // --- Mass Bulk Actions ---
  const handleBatchLaunch = () => {
    if (selectedIds.length === 0) {
      addToast('warning', 'Vui lòng tích chọn các checkbox profile cần thực thi.', 'Hành động trống');
      return;
    }
    
    addSystemLog('Thao tác hàng loạt', 'info', `Yêu cầu khởi chạy đồng loạt ${selectedIds.length} profiles.`);
    addToast('info', `Đang ra lệnh mở đồng chí ${selectedIds.length} trình duyệt...`, 'Đang xử lý hàng loạt');
    
    // Launch one by one with staggered delay for realistic spawning load
    selectedIds.forEach((id, idx) => {
      setTimeout(() => {
        handleLaunchProfile(id);
      }, idx * 400);
    });
  };

  const handleBatchStop = () => {
    if (selectedIds.length === 0) {
      addToast('warning', 'Hãy chọn ít nhất 1 profile để tắt.', 'Hành động trống');
      return;
    }

    addSystemLog('Thao tác hàng loạt', 'info', `Yêu cầu tắt hoàn toàn đồng loạt ${selectedIds.length} profiles.`);
    addToast('info', `Đang đóng ${selectedIds.length} trình duyệt cùng lúc...`, 'Đang xử lý hàng loạt');

    selectedIds.forEach((id) => {
      const prof = profiles.find(p => p.id === id);
      if (prof && prof.status === 'running') {
        handleStopProfile(id);
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      addToast('warning', 'Tích chọn các profile cần hủy xóa.', 'Hành động trống');
      return;
    }

    const runningInBatch = profiles.filter(p => selectedIds.includes(p.id) && p.status === 'running');
    if (runningInBatch.length > 0) {
      addToast('error', `${runningInBatch.length} trình duyệt đang chạy trong mảng chọn. Hãy tắt chúng trước khi xóa.`, 'Yêu cầu bị từ chối');
      return;
    }

    openConfirm(
      'Xóa hàng loạt Browser Profiles?',
      `CẢNH BÁO: Bạn thật sự mong muốn xóa đồng loạt và vĩnh viễn ${selectedIds.length} profiles đã lựa chọn này không? Hành động này không thể hoàn tác.`,
      () => {
        setProfiles(prev => prev.filter(p => !selectedIds.includes(p.id)));
        addSystemLog('Thao tác hàng loạt', 'warning', `Đã xóa sạch ${selectedIds.length} profiles.`);
        addToast('success', `Xóa thành công ${selectedIds.length} profiles.`, 'Đã dọn dẹp');
        setSelectedIds([]);
      }
    );
  };

  const handleApplyBatchTag = () => {
    if (!batchTagValue.trim()) return;
    const cleanTag = batchTagValue.trim();
    
    setProfiles(prev => prev.map(p => {
      if (selectedIds.includes(p.id)) {
        if (!p.tags.includes(cleanTag)) {
          return { ...p, tags: [...p.tags, cleanTag] };
        }
      }
      return p;
    }));

    if (!tags.includes(cleanTag)) {
      setTags(t => [...t, cleanTag]);
    }

    addSystemLog('Thao tác hàng loạt', 'success', `Đã áp dụng thẻ "${cleanTag}" cho ${selectedIds.length} profiles.`);
    addToast('success', `Đã gắn thẻ "${cleanTag}" vào danh sách hàng loạt thành công.`, 'Thành công');
    setBatchTagValue('');
    setBatchActionType('none');
  };

  const handleApplyBatchGroup = () => {
    setProfiles(prev => prev.map(p => {
      if (selectedIds.includes(p.id)) {
        return { ...p, group: batchGroupValue };
      }
      return p;
    }));

    addSystemLog('Thao tác hàng loạt', 'success', `Đã chuyển đổi ${selectedIds.length} profiles sang Group "${batchGroupValue}".`);
    addToast('success', `Đã cập nhật Nhóm "${batchGroupValue}" thành công.`, 'Thành công');
    setBatchActionType('none');
  };

  // --- Simulator Automation: Cookie Warming Scripts ---
  const handleRunWarmingScript = () => {
    const runningProfiles = profiles.filter(p => p.status === 'running');
    if (runningProfiles.length === 0) {
      addToast('warning', 'Không biểu thị profile nào đang chạy. Vui lòng BẬT ít nhất một profile để chạy kịch bản script nuôi.', 'Warming thất bại');
      return;
    }

    setIsWarmingActive(true);
    addToast('success', `Kích hoạt kịch bản "Nuôi Cookie Trình Duyệt" cho ${runningProfiles.length} máy ảo...`, 'Bắt đầu Automation');

    // Run custom sequence of simulated robot task logs
    const stages = [
      { delay: 1000, log: "Truy cập Google Search và gõ từ khóa ngẫu nhiên (Tìm kiếm sàn e-commerce, tin tức)..." },
      { delay: 2800, log: "Nạp tài nguyên Amazon/Shopee... Tiến hành giả lập cuộn trang (Smooth Page Scroll) 1400px." },
      { delay: 4600, log: "Khởi tạo sự kiện chuột di động ngẫu nhiên (Random mouse movement patterns) để cấu thành hành vi người thật." },
      { delay: 6200, log: "Ghi nhận 18 token cookies quảng cáo mới. Lưu trữ dữ liệu cấu hình cache." },
      { delay: 7800, log: "Tiến trình nuôi tích lũy hoàn tất. Đã bảo lưu lịch sử duyệt web để tăng mức uy tín (Trust score)." }
    ];

    stages.forEach((stage, idx) => {
      setTimeout(() => {
        runningProfiles.forEach(p => {
          addSystemLog(p.name, 'info', `[Automation Script] ${stage.log}`);
        });

        if (idx === stages.length - 1) {
          // Final gains
          setProfiles(prev => prev.map(p => {
            if (p.status === 'running') {
              return { ...p, cookiesCount: p.cookiesCount + Math.floor(Math.random() * 25 + 10) };
            }
            return p;
          }));
          setIsWarmingActive(false);
          addToast('success', `Hoàn thành nuôi cookie ngẫu nhiên! Uy tín tài khoản được cải thiện.`, 'Warming hoàn chỉnh');
        }
      }, stage.delay);
    });
  };

  // --- Filtering & Sorting Compute Logic ---
  const toggleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGroup('');
    setSelectedTags([]);
    setSelectedStatus('');
    addToast('info', 'Đã xóa tất cả bộ lọc tìm kiếm.', 'Cài đặt lại');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Perform dynamic client search and filtering
  const filteredProfiles = profiles.filter(p => {
    // Keyword match
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchNote = p.notes.toLowerCase().includes(term);
      const matchGroup = p.group.toLowerCase().includes(term);
      const matchProxy = p.proxy.host.toLowerCase().includes(term);
      const matchPort = p.port ? p.port.toString().includes(term) : false;
      const matchPID = p.pid ? p.pid.toString().includes(term) : false;
      if (!matchName && !matchNote && !matchGroup && !matchProxy && !matchPort && !matchPID) {
        return false;
      }
    }

    // Group filter
    if (selectedGroup && p.group !== selectedGroup) {
      return false;
    }

    // Tag filter (AND logic: profile must match ALL active tags selected)
    if (selectedTags.length > 0) {
      const matchAll = selectedTags.every(t => p.tags.includes(t));
      if (!matchAll) return false;
    }

    // Status filter
    if (selectedStatus && p.status !== selectedStatus) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'group') {
      comparison = a.group.localeCompare(b.group);
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === 'diskSize') {
      // numeric extract
      const getNum = (sz: string) => parseFloat(sz) || 0;
      comparison = getNum(a.diskSize) - getNum(b.diskSize);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // --- Quick Select all toggles ---
  const handleToggleSelectProfile = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredProfiles.map(p => p.id);
    const allSelectedAlready = visibleIds.every(id => selectedIds.includes(id));

    if (allSelectedAlready) {
      // Remove all visible ones
      setSelectedIds(selectedIds.filter(id => !visibleIds.includes(id)));
    } else {
      // Add all visible ones to selection
      const union = Array.from(new Set([...selectedIds, ...visibleIds]));
      setSelectedIds(union);
    }
  };

  const totalCookiesSum = profiles.reduce((sum, p) => sum + p.cookiesCount, 0);

  if (!isLoggedIn) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onCloseToast={removeToast} />
      </>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* Top Main Menu Bar / System title */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-105 bg-slate-100 border border-slate-300 flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-black tracking-wider text-slate-900 uppercase">CD Profile Manager</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-bold border border-emerald-250">CDPM v2.4</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 animate-fadeIn">Hệ thống proxy & mạo danh vân tay trình duyệt local</p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Stats Topbar */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-bold">Tổng:</span>
              <span className="font-bold text-slate-800 font-mono">{profiles.length}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500 font-bold">Đang chạy:</span>
              <span className="font-bold text-emerald-700 font-mono">{profiles.filter(p => p.status === 'running').length}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-bold">Cookies:</span>
              <span className="font-bold text-sky-700 font-mono">{totalCookiesSum.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingProfile(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold rounded text-white text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Profile Mới</span>
          </button>

          {/* User Account Info and Logout */}
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3.5 ms-1.5 h-6">
            <div className="hidden sm:flex flex-col text-right leading-none">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Tài khoản</span>
              <span className="text-xs font-bold text-slate-700 capitalize mt-0.5">{loggedUser}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>      {/* Dynamic Bulk Action Context toolbar popup */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs animate-fadeIn text-emerald-990 text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã chọn <strong className="text-emerald-950">{selectedIds.length}</strong> profile trong danh sách</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-600 hover:text-slate-900 uppercase text-[10px] ml-2 font-bold p-1 rounded bg-white border border-slate-250 cursor-pointer shadow-sm"
            >
              Hủy lựa chọn
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchLaunch}
              className="px-3 py-1 bg-white hover:bg-slate-50 rounded border border-slate-250 font-bold cursor-pointer text-[11px] text-slate-705 text-slate-700 flex items-center gap-1 shadow-sm"
            >
              <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>Khởi động đồng loạt ({selectedIds.length})</span>
            </button>

            <button
              onClick={handleBatchStop}
              className="px-3 py-1 bg-white hover:bg-slate-50 rounded border border-slate-250 font-bold cursor-pointer text-[11px] text-slate-705 text-slate-700 flex items-center gap-1 shadow-sm"
            >
              <Square className="w-3 h-3 text-rose-600 fill-rose-600" />
              <span>Tắt đồng loạt ({selectedIds.length})</span>
            </button>

            {/* Change Group or tag fast */}
            {batchActionType === 'none' ? (
              <>
                <button
                  onClick={() => setBatchActionType('tag')}
                  className="px-3 py-1 bg-white hover:bg-slate-50 rounded border border-slate-250 font-bold cursor-pointer text-[11px] text-slate-705 text-slate-700 flex items-center gap-1 shadow-sm"
                >
                  <Tag className="w-3 h-3 text-sky-600" />
                  <span>Dán nhãn hàng loạt</span>
                </button>

                <button
                  onClick={() => setBatchActionType('group')}
                  className="px-3 py-1 bg-white hover:bg-slate-50 rounded border border-slate-250 font-bold cursor-pointer text-[11px] text-slate-705 text-slate-700 flex items-center gap-1 shadow-sm"
                >
                  <Layers2 className="w-3 h-3 text-amber-500" />
                  <span>Đổi Nhóm</span>
                </button>
              </>
            ) : batchActionType === 'tag' ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <input
                  type="text"
                  placeholder="Thẻ dán chung..."
                  value={batchTagValue}
                  onChange={(e) => setBatchTagValue(e.target.value)}
                  className="bg-white border border-slate-250 rounded px-2 py-0.5 text-xs text-slate-800 placeholder-slate-400 font-medium h-7 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <button
                  onClick={handleApplyBatchTag}
                  className="bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded text-white font-bold h-7 cursor-pointer text-[11px]"
                >
                  Áp dụng
                </button>
                <button
                  onClick={() => setBatchActionType('none')}
                  className="text-slate-500 hover:text-slate-800 px-1 font-bold cursor-pointer text-[11px]"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <select
                  value={batchGroupValue}
                  onChange={(e) => setBatchGroupValue(e.target.value)}
                  className="bg-white border border-slate-250 rounded px-2 py-0.5 text-xs text-slate-800 h-7"
                >
                  {groups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <button
                  onClick={handleApplyBatchGroup}
                  className="bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded text-white font-bold h-7 cursor-pointer text-[11px]"
                >
                  Áp dụng
                </button>
                <button
                  onClick={() => setBatchActionType('none')}
                  className="text-slate-500 hover:text-slate-800 px-1 font-bold cursor-pointer text-[11px]"
                >
                  Hủy
                </button>
              </div>
            )}

            <span className="w-px h-4 bg-emerald-250 mx-1" />

            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-105 hover:bg-rose-100 border border-rose-250 border-rose-200 rounded font-bold cursor-pointer text-[11px] text-rose-700 flex items-center gap-1"
              title="Xóa vĩnh viễn mảng chọn"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar Rail */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          profiles={profiles}
          isWarmingActive={isWarmingActive}
          onRefreshStats={() => {
            addToast('info', 'Đồng bộ hóa dữ liệu vân tay & ping proxy thành công.', 'Đồng bộ tự động');
            addSystemLog('Hệ thống', 'info', 'Đã tải dọn dẹp các mảng đệm cache máy ảo.');
          }}
        />

        {/* --- PAGE 1: PROFILES MANAGER (Quản lý Profiles) --- */}
        {activePage === 'profiles' && (
          <div className="flex-1 p-5 overflow-y-auto flex flex-col space-y-4 bg-slate-50/50 animate-fadeIn">
            
            {/* Action Header / Operations toolbar inside dashboard */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                  <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Danh bạ Profiles ({filteredProfiles.length} / {profiles.length})</span>
                </span>
                
                {/* Reset to see everything */}
                {(searchTerm || selectedGroup || selectedTags.length > 0 || selectedStatus) && (
                  <span className="text-[10px] bg-white text-slate-650 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 animate-fadeIn font-medium">
                    <span>Có bộ lọc đang bật</span>
                    <button 
                      onClick={handleClearFilters} 
                      className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                      title="Xóa nhanh bộ lọc"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>

              {/* Dummy system import/export files option */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-slate-400 text-[10px] font-bold">Cài đặt tệp:</span>
                <button 
                  onClick={() => {
                    try {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
                      const dlAnchor = document.createElement('a');
                      dlAnchor.setAttribute("href", dataStr);
                      dlAnchor.setAttribute("download", `cdpm_profiles_backup_${Date.now()}.json`);
                      dlAnchor.click();
                      addToast('success', 'Xuất file backup cấu hình JSON thành công.', 'Backup thành công');
                      addSystemLog('Hệ thống', 'success', 'Đã đóng gói backup file toàn bộ database profile.');
                    } catch (e) {
                      addToast('error', 'Lỗi xuất tệp sao lưu.');
                    }
                  }}
                  className="hover:text-slate-800 flex items-center gap-1 font-bold hover:bg-slate-100 w-fit p-1 px-2.5 bg-white border border-slate-200 rounded transition shadow-sm cursor-pointer"
                  title="Xuất file backup JSON"
                >
                  <FileJson className="w-3" />
                  <span>Backup JSON</span>
                </button>

                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event: any) => {
                        try {
                          const imported = JSON.parse(event.target.result);
                          if (Array.isArray(imported)) {
                            setProfiles(prev => [...imported, ...prev]);
                            addToast('success', `Đã nhập thành công thêm ${imported.length} profiles mới!`, 'Nhập file hoàn tất');
                            addSystemLog('Import tệp', 'success', `Đã nạp thủ công thêm ${imported.length} profile bằng tập tin JSON.`);
                          } else {
                            addToast('error', 'Nội dung file JSON không đúng cấu trúc mảng profiles.');
                          }
                        } catch (err) {
                          addToast('error', 'Lỗi kiểm định cú pháp JSON.', 'Sự cố import');
                        }
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }}
                  className="hover:text-slate-800 flex items-center gap-1 font-bold hover:bg-slate-100 w-fit p-1 px-2.5 bg-white border border-slate-200 rounded transition shadow-sm cursor-pointer"
                  title="Nhập nạp profiles tự động từ JSON"
                >
                  <Upload className="w-3 text-emerald-600" />
                  <span>Import JSON</span>
                </button>
              </div>
            </div>

            {/* --- Filter panel moved directly above list screen --- */}
            <div className="bg-white p-4 rounded-xl border border-slate-250/70 shadow-xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Term input (5 cols) */}
                <div className="md:col-span-5 relative">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Tìm kiếm chi tiết</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm theo tên profile, ghi chú, port, địa chỉ proxy, PID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
                
                {/* Chosen Group selector (3 cols) */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Nhóm (Group)</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition cursor-pointer"
                  >
                    <option value="">-- Tất cả nhóm --</option>
                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chosen Status selector (4 cols) */}
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Trạng thái máy ảo</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: '', label: 'Tất cả' },
                      { id: 'running', label: 'Online' },
                      { id: 'stopped', label: 'Offline' },
                      { id: 'error', label: 'Lỗi' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStatus(st.id)}
                        className={`py-1.5 rounded-lg text-center text-xs transition border cursor-pointer font-semibold ${
                          selectedStatus === st.id
                            ? 'bg-slate-800 border-slate-800 text-white font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650 hover:text-slate-900'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tag filtering sub-row */}
              {tags.length > 0 && (
                <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" /> Thẻ dán (Tags):
                  </span>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {tags.map((tag) => {
                      const count = profiles.filter(p => p.tags.includes(tag)).length;
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTagFilter(tag)}
                          className={`text-[11px] px-2.5  py-0.5 rounded-full flex items-center gap-1.5 transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800 border-slate-800 text-white font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-3xs'
                          }`}
                        >
                          <span>{tag}</span>
                          <span className={`text-[9px] font-mono opacity-80 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>({count})</span>
                        </button>
                      );
                    })}
                    {(selectedTags.length > 0 || searchTerm || selectedGroup || selectedStatus) && (
                      <button
                        onClick={handleClearFilters}
                        className="text-[10px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-0.5 rounded transition cursor-pointer font-bold"
                      >
                        Reset Bộ Lọc
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Core high density table */}
            <ProfileTable
              filteredProfiles={filteredProfiles}
              selectedIds={selectedIds}
              toggleSelectProfile={handleToggleSelectProfile}
              toggleSelectAll={handleToggleSelectAll}
              onLaunch={handleLaunchProfile}
              onStop={handleStopProfile}
              onDelete={handleDeleteProfile}
              onDuplicate={handleDuplicateProfile}
              onEdit={(id) => {
                const target = profiles.find(p => p.id === id);
                if (target) {
                  setEditingProfile(target);
                  setIsModalOpen(true);
                }
              }}
              onTestProxy={handleTestProxyFromList}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              proxyTestLoadingId={proxyTestLoadingId}
            />
          </div>
        )}

        {/* --- PAGE 5: VIDEO MANAGER (Quản lý Video) --- */}
        {activePage === 'videos' && (
          <VideoManager
            initialChannels={MOCK_CHANNELS}
            initialVideos={MOCK_VIDEOS}
            addToast={addToast}
            addSystemLog={addSystemLog}
          />
        )}

        {/* --- PAGE 2: PROXY MANAGER (Quản lý Proxy) --- */}
        {activePage === 'proxies' && (
          <div className="flex-1 p-5 overflow-y-auto flex flex-col space-y-4 bg-slate-50/50 animate-fadeIn">
            {/* Proxy header card board */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-600 animate-pulse" /> Hệ thống kiểm soát Proxy
                </h2>
                <p className="text-[10px] text-slate-400">Đo lường ping liên kết, định vị IP và phân giải socket truyền độc lập</p>
              </div>
              <button
                onClick={handleBulkTestProxies}
                disabled={bulkTesting}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 font-bold rounded text-white text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${bulkTesting ? 'animate-spin' : ''}`} />
                <span>{bulkTesting ? 'Đang Test...' : 'Check All Proxy'}</span>
              </button>
            </div>

            {/* Top Stats of Proxy */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Cài proxy</p>
                  <p className="text-lg font-black text-slate-800 font-mono mt-0.5">
                    {profiles.filter(p => p.proxy.type !== 'direct').length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-sky-500" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">SOCKS5 / HTTPS</p>
                  <p className="text-lg font-black text-sky-650 font-mono mt-0.5">
                    {profiles.filter(p => p.proxy.type === 'socks5' || p.proxy.type === 'http').length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-sky-600" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Kết nối Trực tiếp (Direct)</p>
                  <p className="text-lg font-black text-slate-600 font-mono mt-0.5">
                    {profiles.filter(p => p.proxy.type === 'direct').length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Tốc độ trung bình (Tested)</p>
                  <p className="text-lg font-black text-purple-700 font-mono mt-0.5">
                    {(Object.values(proxyRatings) as { ping: number; status: string }[]).filter(r => r.ping > 0).length > 0
                      ? `${Math.round(
                          (Object.values(proxyRatings) as { ping: number; status: string }[])
                            .filter(r => r.ping > 0)
                            .reduce((sum, r) => sum + r.ping, 0) /
                            (Object.values(proxyRatings) as { ping: number; status: string }[]).filter(r => r.ping > 0).length
                        )} ms`
                      : 'N/A'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Split Proxy layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Proxy List Block */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase">Danh bạ kết nối các Profiles</span>
                  <div className="relative w-48 font-sans">
                    <input
                      type="text"
                      placeholder="Lọc proxy..."
                      value={proxySearchTerm}
                      onChange={(e) => setProxySearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                    />
                    <Search className="w-3 h-3 text-slate-400 absolute right-2.5 top-2" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-250 text-slate-500 font-medium whitespace-nowrap">
                        <th className="p-3 font-semibold text-[10px] uppercase">Tên Profile</th>
                        <th className="p-3 font-semibold text-[10px] uppercase">Giao thức</th>
                        <th className="p-3 font-semibold text-[10px] uppercase">Địa chỉ (Host)</th>
                        <th className="p-3 font-semibold text-[10px] uppercase">Cổng (Port)</th>
                        <th className="p-3 font-semibold text-[10px] uppercase">Ping Rating</th>
                        <th className="p-3 font-semibold text-[10px] uppercase text-right">Trực quan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profiles
                        .filter(p => {
                          if (!proxySearchTerm) return true;
                          const term = proxySearchTerm.toLowerCase();
                          return (
                            p.name.toLowerCase().includes(term) ||
                            p.proxy.host.toLowerCase().includes(term) ||
                            p.proxy.type.toLowerCase().includes(term)
                          );
                        })
                        .map((prof) => {
                          const hasProxy = prof.proxy.type !== 'direct';
                          const testResult = proxyRatings[prof.id];
                          const isLoading = testResult && testResult.ping === 0 && testResult.status === 'ok';

                          return (
                            <tr key={prof.id} className="hover:bg-slate-50/85 transition-colors">
                              <td className="p-3 font-bold text-slate-800">{prof.name}</td>
                              <td className="p-3">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  prof.proxy.type === 'direct' 
                                    ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                                    : prof.proxy.type === 'socks5'
                                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}>
                                  {prof.proxy.type}
                                </span>
                              </td>
                              <td className="p-3 font-mono font-medium text-slate-600">
                                {hasProxy ? prof.proxy.host : 'Đường dẫn trực tiếp local'}
                              </td>
                              <td className="p-3 font-mono text-slate-500">
                                {hasProxy ? prof.proxy.port : '--'}
                              </td>
                              <td className="p-3">
                                {isLoading ? (
                                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold animate-pulse">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang ping...
                                  </span>
                                ) : testResult ? (
                                  testResult.status === 'fail' ? (
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">Error/Timed Out</span>
                                  ) : (
                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                      testResult.ping < 120 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                        : 'bg-amber-50 border-amber-100 text-amber-700'
                                    }`}>
                                      {testResult.ping} ms
                                    </span>
                                  )
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Chưa kiểm tra</span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {hasProxy && (
                                  <button
                                    onClick={() => testProxyWithId(prof.id)}
                                    disabled={isLoading}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-[10px] font-bold text-slate-700 rounded transition cursor-pointer"
                                  >
                                    Test Connection
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {profiles.length === 0 && (
                    <div className="p-8 text-center text-slate-400">Chưa có dữ liệu profiles</div>
                  )}
                </div>
              </div>

              {/* Utility Proxy manual panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-600" /> Hướng dẫn proxy
                  </h3>
                  <div className="text-[11px] text-slate-500 leading-relaxed space-y-2">
                    <p>CD Profile Manager hỗ trợ tích hợp sâu các giao thức chuyển tải proxy, giúp các máy ảo Chrome có lưu lượng truyền độc lập:</p>
                    <ul className="list-disc leading-normal pl-4 space-y-1">
                      <li><strong>HTTP (Proxy)</strong>: Giao thức truyền tiêu chuẩn. Trọng tải nhẹ.</li>
                      <li><strong>SOCKS5</strong>: Hỗ trợ mã hóa kết nối tốt nhất. Đăng nhập nhanh.</li>
                      <li><strong>Direct Connection</strong>: Dùng chính mạng LAN của bạn. Sẽ bị lộ cùng một địa chỉ IP thật nếu dùng ở các profile khác nhau.</li>
                    </ul>
                    <p className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-800 font-medium">
                      Mẹo: Để cấu hình proxy cho profile, nhấn nút "Sửa" trên profile rồi điều chỉnh trong mục Cấu hình Proxy của bảng Modal.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center space-y-2.5">
                  <Sliders className="w-8 h-8 text-purple-600 mx-auto" />
                  <h4 className="text-xs font-black text-slate-800 uppercase">IP Geolocation Detection</h4>
                  <p className="text-[11px] text-slate-500">Mô phỏng tiêm (injection) các thông tin kinh độ vĩ độ và quốc gia tương ứng từ IP Proxy của bạn tự động.</p>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1 font-mono text-slate-600 text-left">
                    <div>📍 Latitude: <span className="text-indigo-600">Auto proxy coordinates</span></div>
                    <div>🏢 ISP: <span className="text-indigo-600">Simulated by proxy Hostname</span></div>
                    <div>🕰 Timezone: <span className="text-indigo-600">Match Location Timezone</span></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- PAGE 3: AUTOMATION & COOKIES WARMING (Kịch bản nuôi) --- */}
        {activePage === 'automation' && (
          <div className="flex-1 p-5 overflow-y-auto flex flex-col space-y-4 bg-slate-50/50 animate-fadeIn">
            {/* Page Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-150 flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    Kịch bản Robot "Nuôi Cookie tương tác"
                  </h2>
                  <p className="text-[10px] text-slate-400">Tự động cấu tạo phiên lướt web ảo để tăng trust score, nạp cookie tiếp thị liên kết</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunWarmingScript}
                  disabled={isWarmingActive}
                  className="px-4 py-1.5 bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 font-bold rounded text-white text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                  <span>{isWarmingActive ? 'Đang chạy tự động...' : 'Chạy kịch bản Robot'}</span>
                </button>
              </div>
            </div>

            {/* Split controls layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Configuration panel (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" /> Tham số kịch bản lướt
                </h3>

                {/* Automation targets (Checkboxes) */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Môi trường website nạp cookie</label>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {[
                      { id: 'google.com', val: 'Tìm kiếm Google Search ngẫu nhiên' },
                      { id: 'amazon.com', val: 'Scrape / Lướt xem giỏ hàng Amazon' },
                      { id: 'shopee.vn', val: 'Simulate click sản phẩm Shopee VN' },
                      { id: 'youtube.com', val: 'Watch video YouTube nuôi lịch sử xem' },
                      { id: 'facebook.com', val: 'Lướt tin feed cuộn trang mạng xã hội' },
                    ].map((site) => {
                      const active = warmSites.includes(site.id);
                      return (
                        <label key={site.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 border border-slate-100 rounded-lg cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => {
                              if (active) {
                                setWarmSites(warmSites.filter(x => x !== site.id));
                              } else {
                                setWarmSites([...warmSites, site.id]);
                              }
                            }}
                            className="rounded text-emerald-605 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="font-medium text-slate-650">{site.val}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Slider and inputs */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Tốc độ cuộn trang (px/s)</label>
                    <input
                      type="number"
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Dừng nghỉ (giây)</label>
                    <input
                      type="number"
                      value={sleepDuration}
                      onChange={(e) => setSleepDuration(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-250/70 text-[11px] text-amber-800 space-y-1 font-medium">
                  <p className="font-extrabold uppercase text-[10px] text-amber-900 tracking-wider flex items-center gap-1">
                    ⚠️ Điều kiện bắt đầu:
                  </p>
                  <p>Mở ít nhất 1 Browser Profile thành công lên trước (Status ở dạng ĐANG CHẠY màu xanh), sau đó nhấn chạy Robot để Robot tiêm hành vi lướt web ảo.</p>
                </div>
              </div>

              {/* Status and Console output (7 cols) */}
              <div className="lg:col-span-7 flex flex-col bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-md font-mono min-h-[360px]">
                <div className="bg-slate-850 p-3 border-b border-slate-750 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-slate-300 font-bold">Automation sequence logger (Local)</span>
                  </div>
                  {isWarmingActive && (
                    <span className="text-[9px] bg-emerald-500 text-slate-900 px-1.5 py-0.2 rounded font-black animate-pulse font-sans">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-2 text-[11px] font-mono scrollbar-thin select-text">
                  {logs
                    .filter(l => l.message.includes('[Automation Script]'))
                    .map((item) => (
                      <div key={item.id} className="leading-relaxed slide-up text-slate-250">
                        <span className="text-slate-500 mr-2">[{item.timestamp}]</span>
                        <span className="text-sky-400 font-bold">[{item.profileName}]</span>{' '}
                        <span className="text-emerald-300 font-semibold">{item.message.replace('[Automation Script] ', '')}</span>
                      </div>
                    ))}
                  {logs.filter(l => l.message.includes('[Automation Script]')).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-2 font-sans">
                      <Terminal className="w-8 h-8 text-slate-600 animate-bounce" />
                      <p>Danh sách kịch bản rỗng. Bật profile rồi bấm "Chạy kịch bản Robot" để nạp tài trình lướt.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- PAGE 4: SYSTEM SETTINGS & GROUP MANAGER (Hệ thống & Cấu hình) --- */}
        {activePage === 'settings' && (
          <div className="flex-1 p-5 overflow-y-auto flex flex-col space-y-4 bg-slate-50/50 animate-fadeIn">
            {/* Header Title */}
            <div>
              <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-purple-600" /> Thiết lập hệ thống & Quản lý Nhóm
              </h2>
              <p className="text-[10px] text-slate-400">Thay đổi phân nhóm quản lý, mở rộng presets mặc định cho profile tạo mới</p>
            </div>

            {/* Config cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Group Manager Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>Quản lý Nhóm phân bổ (Groups)</span>
                  <span className="text-[10px] text-purple-600 font-black">Tổng: {groups.length}</span>
                </h3>
                
                {/* Add new Group input form */}
                <div className="flex gap-2 font-sans">
                  <input
                    type="text"
                    placeholder="Nhập tên Group mới..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                  <button
                    onClick={() => {
                      if (!newGroupName.trim()) return;
                      const clean = newGroupName.trim();
                      if (groups.includes(clean)) {
                        addToast('warning', `Nhóm "${clean}" đã có rồi.`);
                        return;
                      }
                      setGroups([...groups, clean]);
                      addToast('success', `Đã đăng ký thêm Nhóm "${clean}" mới.`);
                      setNewGroupName('');
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Đăng ký
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {groups.map((g) => {
                    const affiliatedCount = profiles.filter(p => p.group === g).length;
                    return (
                      <div key={g} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-150 border-slate-100 rounded-lg text-xs">
                        <span className="font-bold text-slate-700">{g}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono bg-white border border-slate-200 px-1 py-0.2 rounded">
                            {affiliatedCount} profiles
                          </span>
                          {g !== 'Mặc định' && affiliatedCount === 0 && (
                            <button
                              onClick={() => {
                                setGroups(groups.filter(x => x !== g));
                                addToast('info', `Đã xóa nhóm trống "${g}".`);
                              }}
                              className="text-rose-500 hover:text-rose-700 text-[10px] font-bold cursor-pointer"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tags Manager Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>Quản lý Thẻ (Tags Manager)</span>
                  <span className="text-[10px] text-emerald-600 font-black">Tổng: {tags.length}</span>
                </h3>

                {/* Add new Tag input form */}
                <div className="flex gap-2 font-sans">
                  <input
                    type="text"
                    placeholder="Nhập nhãn Tag mới..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button
                    onClick={() => {
                      if (!newTagName.trim()) return;
                      const clean = newTagName.trim();
                      if (tags.includes(clean)) {
                        addToast('warning', `Tag "${clean}" đã có rồi.`);
                        return;
                      }
                      setTags([...tags, clean]);
                      addToast('success', `Đã đăng ký thêm nhãn Tag "${clean}" mới.`);
                      setNewTagName('');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Đăng ký Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {tags.map((t) => {
                    const count = profiles.filter(p => p.tags.includes(t)).length;
                    return (
                      <span key={t} className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-700">
                        <Tag className="w-2.5 h-2.5 text-slate-550" />
                        <span className="font-bold">{t}</span>
                        <span className="text-[9px] font-mono text-slate-400">({count})</span>
                        {count === 0 && (
                          <button
                            onClick={() => {
                              setTags(tags.filter(x => x !== t));
                              addToast('info', `Hủy bỏ nhãn tag rỗng "${t}".`);
                            }}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Preset Fingerprint defaults */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Preset hệ điều hành mặc định
                </h3>
                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block text-slate-450 uppercase text-[9px] font-extrabold mb-1">Mô phỏng Hệ điều hành mặc định (Default OS)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['windows', 'macos', 'linux'].map(os => {
                        const active = defaultOS === os;
                        return (
                          <button
                            key={os}
                            onClick={() => {
                              setDefaultOS(os as any);
                              addToast('success', `Đã cài đặt preset OS mặc định là: ${os.toUpperCase()}`);
                            }}
                            className={`py-1.5 text-center text-xs border rounded-lg cursor-pointer transition font-bold uppercase ${
                              active 
                                ? 'bg-purple-50 border-purple-305 text-purple-700 border-purple-300 shadow-3xs' 
                                : 'bg-slate-50 border-slate-200 text-slate-650'
                            }`}
                          >
                            {os}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-450 uppercase text-[9px] font-extrabold mb-1">Độ phân giải màn hình mặc định (Default Resolution)</label>
                    <select
                      value={defaultResolution}
                      onChange={(e) => {
                        setDefaultResolution(e.target.value);
                        addToast('success', `Màn hình render mặc định: ${e.target.value}`);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="1920x1080">1920 x 1080 (HD 1080p - Phổ biến nhất)</option>
                      <option value="1440x900">1440 x 900 (MacBook Air presets)</option>
                      <option value="1366x768">1366 x 768 (Laptops phân giải thấp)</option>
                      <option value="2560x1440">2560 x 1440 (Retina màn lớn QHD)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Thư mục lưu trữ Profiles data */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-amber-500" /> Cấu hình thư mục lưu trữ (Storage Folder)
                  </span>
                  <span className="text-[10px] text-amber-600 font-mono font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100">Đã đồng bộ</span>
                </h3>

                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block text-slate-405 uppercase text-[9px] font-extrabold mb-1">Đường dẫn thư mục hiện tại</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempStoragePath}
                        onChange={(e) => setTempStoragePath(e.target.value)}
                        placeholder="Ví dụ: C:\CDProfileManager\profiles_data"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white font-mono"
                      />
                      <button
                        onClick={() => {
                          if (!tempStoragePath.trim()) {
                            addToast('warning', 'Vui lòng nhập đường dẫn thư mục hợp lệ.');
                            return;
                          }
                          const cleanPath = tempStoragePath.trim();
                          setProfileStoragePath(cleanPath);
                          localStorage.setItem('cdpm_profile_storage_path', cleanPath);
                          addToast('success', `Đã cập nhật thư mục lưu trữ: ${cleanPath}`, 'Lưu thành công');
                          addSystemLog('Hệ thống', 'success', `Đã cấu hình đường dẫn lưu trữ mới: ${cleanPath}`);
                        }}
                        className="px-3 bg-slate-800 hover:bg-slate-900 border border-slate-800 hover:border-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Lưu đường dẫn"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-slate-405 uppercase text-[9px] font-extrabold mb-1.5 font-sans">Chọn nhanh đường dẫn (Presets)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Windows Default', path: 'C:\\CDProfileManager\\profiles_data' },
                        { name: 'macOS Default', path: '/Users/shared/cdpm/profiles' },
                        { name: 'Linux Default', path: '/var/lib/cdpm/profiles' }
                      ].map((preset) => {
                        const isSelected = profileStoragePath === preset.path;
                        return (
                          <button
                            key={preset.name}
                            onClick={() => {
                              setTempStoragePath(preset.path);
                              setProfileStoragePath(preset.path);
                              localStorage.setItem('cdpm_profile_storage_path', preset.path);
                              addToast('success', `Đã chuyển đổi sang preset: ${preset.name}`);
                              addSystemLog('Hệ thống', 'info', `[Cài đặt] Áp dụng preset đường dẫn: ${preset.path}`);
                            }}
                            className={`py-1 bg-slate-50 border hover:bg-slate-100 rounded text-[10px] font-semibold transition text-slate-600 text-center truncate px-1 cursor-pointer ${
                              isSelected ? 'border-amber-500 bg-amber-50 text-amber-850 font-bold ring-1 ring-amber-500' : 'border-slate-200'
                            }`}
                          >
                            {preset.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">Công cụ mô phỏng thư mục</span>
                      <button
                        onClick={() => {
                          addToast('success', `Đã khởi chạy Explorer mở thư mục tại: ${profileStoragePath}`);
                          addSystemLog('Hệ thống Explorer', 'success', `[Mở Folder] Đã mở thư mục hệ thống cục bộ: "${profileStoragePath}" thành công.`);
                        }}
                        className="text-[10px] text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <FolderOpen className="w-3 h-3" /> Mở thư mục vật lý
                      </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] font-mono text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>📁 Root Directory:</span>
                        <span className="text-slate-800 font-bold font-mono">{profileStoragePath}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📦 Trạng thái dọn dẹp:</span>
                        <span className="text-emerald-600 font-bold">Hoạt động tốt (Active)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💾 Dung lượng ổ đĩa ảo:</span>
                        <span className="text-slate-800 font-bold">184.2 GB trống / 512 GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Environment Sandbox overview */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-600" /> Tổng quan Database Local
                </h3>
                <div className="text-[11px] text-slate-500 leading-relaxed font-sans space-y-2">
                  <p>Hệ thống CD Profile Manager lưu giữ toàn bộ thông số vân tay chống quét chéo dựa trên bộ lưu trữ an toàn <strong>localStorage sandbox</strong> của vùng an toàn trình duyệt của bạn:</p>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] space-y-1 font-mono text-slate-650">
                    <div>🗄️ Dung lượng metadata: ~{(JSON.stringify(profiles).length / 1024).toFixed(2)} KB</div>
                    <div>📦 Tổng số profile nạp: {profiles.length} items</div>
                    <div>🏷️ Tổng số tag nạp: {tags.length} items</div>
                  </div>

                  <p className="text-rose-600 font-bold">
                    * Lưu ý: Không tiến hành xóa Cookies/Xóa Cache của trình duyệt chính, vì hành vi đó sẽ vô tình xóa rỗng bộ database giả lập của CD Profile Manager.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Unified modal and prompt components */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveProfile}
        profile={editingProfile}
        groups={groups}
        tags={tags}
      />

      {/* Dynamic Confirmation Dialog Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-150 overflow-hidden transform scale-100 transition-all">
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              </div>
              <div className="space-y-1 flex-1 select-none font-sans">
                <h4 className="text-sm font-black text-slate-800 leading-snug">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-slate-505 leading-relaxed font-semibold">
                  {confirmModal.description}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 flex items-center justify-end gap-2 border-t border-slate-150/65">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-605 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 border border-rose-600 hover:border-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
              >
                {confirmModal.confirmText || 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic notifications popups viewport container */}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />

    </div>
  );
}
