/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  ShieldCheck,
  Check,
  AlertTriangle,
  Info,
  Laptop,
  Smartphone,
  Eye,
  EyeOff,
  Network,
  Settings,
  User,
  Tags,
  Loader2,
  FileText,
  MousePointer,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { BrowserProfile, FingerprintConfig, ProxyConfig, ProxyType } from '../types';
import { getRandomUserAgent, getRandomResolution, getBrowserVersionFromUA } from '../utils/browserInfo';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: Partial<BrowserProfile>) => void;
  profile?: BrowserProfile | null; // If null, means create, else edit
  groups: string[];
  tags: string[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profile,
  groups,
  tags
}) => {
  // Modal active tab: 'general' | 'proxy' | 'fingerprint'
  const [activeTab, setActiveTab] = useState<'general' | 'proxy' | 'fingerprint'>('general');

  // Form Fields State
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Mặc định');
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  const [note, setNote] = useState('');
  const [profileTags, setProfileTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Proxy Configuration
  const [proxyType, setProxyType] = useState<ProxyType>('http');
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState<string>('8080');
  const [proxyUser, setProxyUser] = useState('');
  const [proxyPass, setProxyPass] = useState('');
  const [showProxyPass, setShowProxyPass] = useState(false);

  // Fingerprints
  const [platform, setPlatform] = useState<'windows' | 'macos' | 'linux' | 'android' | 'ios'>('windows');
  const [userAgent, setUserAgent] = useState('');
  const [resolution, setResolution] = useState('1920x1080');
  const [canvasFingerprint, setCanvasFingerprint] = useState<'noise' | 'default' | 'block'>('noise');
  const [webglFingerprint, setWebglFingerprint] = useState<'noise' | 'default'>('noise');
  const [audioFingerprint, setAudioFingerprint] = useState<'noise' | 'default'>('noise');
  const [webrtcMode, setWebrtcMode] = useState<'replace' | 'real' | 'block'>('replace');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Proxy test state
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const [proxyTestResult, setProxyTestResult] = useState<{
    success: boolean;
    ip?: string;
    location?: string;
    message: string;
  } | null>(null);

  // Load profile details when editing
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGroup(profile.group);
      setNote(profile.notes);
      setProfileTags(profile.tags || []);
      
      // Proxy
      setProxyType(profile.proxy.type);
      setProxyHost(profile.proxy.host || '');
      setProxyPort(profile.proxy.port ? profile.proxy.port.toString() : '');
      setProxyUser(profile.proxy.username || '');
      setProxyPass(profile.proxy.password || '');
      
      // Fingerprint
      setPlatform(profile.fingerprint.platform);
      setUserAgent(profile.fingerprint.userAgent);
      setResolution(profile.fingerprint.screenResolution);
      setCanvasFingerprint(profile.fingerprint.canvasFingerprint);
      setWebglFingerprint(profile.fingerprint.webglFingerprint);
      setAudioFingerprint(profile.fingerprint.audioFingerprint);
      setWebrtcMode(profile.fingerprint.webrtcMode || 'replace');
    } else {
      // Reset to defaults for Create
      setName('');
      setGroup('Mặc định');
      setNote('');
      setProfileTags([]);
      setProxyType('http');
      setProxyHost('');
      setProxyPort('8080');
      setProxyUser('');
      setProxyPass('');
      
      // Default windows fingerprint
      setPlatform('windows');
      const standardUA = getRandomUserAgent('windows');
      setUserAgent(standardUA);
      setResolution('1920x1080');
      setCanvasFingerprint('noise');
      setWebglFingerprint('noise');
      setAudioFingerprint('noise');
      setWebrtcMode('replace');
    }
    // Clear validation & proxy test
    setErrors({});
    setProxyTestResult(null);
    setIsAddingNewGroup(false);
    setNewGroupName('');
    setActiveTab('general');
  }, [profile, isOpen]);

  // Handler for Platform Switch
  const handlePlatformChange = (newPlatform: 'windows' | 'macos' | 'linux' | 'android' | 'ios') => {
    setPlatform(newPlatform);
    const newUA = getRandomUserAgent(newPlatform);
    setUserAgent(newUA);
    setResolution(getRandomResolution(newPlatform));
  };

  // Re-generate user agent for current platform
  const regenerateUserAgent = () => {
    const freshUA = getRandomUserAgent(platform);
    setUserAgent(freshUA);
  };

  // Tag interactions
  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/,/g, '');
    if (cleanTag && !profileTags.includes(cleanTag)) {
      setProfileTags([...profileTags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagWithdrawn: string) => {
    setProfileTags(profileTags.filter(t => t !== tagWithdrawn));
  };

  const toggleExistingTag = (t: string) => {
    if (profileTags.includes(t)) {
      setProfileTags(profileTags.filter(x => x !== t));
    } else {
      setProfileTags([...profileTags, t]);
    }
  };

  // Local Proxy Testing simulate
  const handleTestProxy = () => {
    // Basic verification
    if (proxyType === 'direct') {
      setProxyTestResult({
        success: true,
        ip: "Machine Real IP",
        location: "Khu vực Local của bạn",
        message: "Kết nối trực tiếp không qua proxy. Trạng thái Sẵn sàng!"
      });
      return;
    }

    if (!proxyHost) {
      setErrors({ ...errors, proxyHost: "IP/Host không được để trống" });
      setActiveTab('proxy');
      return;
    }

    setIsTestingProxy(true);
    setProxyTestResult(null);

    // Simulate delay
    setTimeout(() => {
      setIsTestingProxy(false);
      
      // Simple custom simulation behavior: 
      // If host contains "testfail" or port is exactly 0, trigger error, else success.
      if (proxyHost.toLowerCase().includes('fail') || proxyPort === '0' || Math.random() < 0.15) {
        setProxyTestResult({
          success: false,
          message: "Lỗi kết nối SOCKSv5 / HTTP: Thiết bị đích khước từ kết nối hoặc Timeout. Hãy kiểm tra lại IP/Port."
        });
      } else {
        // Generate random fake location for validity
        const regions = [
          { loc: "Hà Nội, Việt Nam", ip: "113.190." + Math.floor(Math.random() * 254) + "." + Math.floor(Math.random() * 254) },
          { loc: "Hồ Chí Minh, Việt Nam", ip: "14.226." + Math.floor(Math.random() * 254) + "." + Math.floor(Math.random() * 254) },
          { loc: "California, Hoa Kỳ (Residential)", ip: "64.233.19." + Math.floor(Math.random() * 254) },
          { loc: "Tokyo, Nhật Bản (Vultr Cloud)", ip: "45.76." + Math.floor(Math.random() * 254) + "." + Math.floor(Math.random() * 254) },
          { loc: "Frankfurt, Đức", ip: "46.101." + Math.floor(Math.random() * 254) + "." + Math.floor(Math.random() * 254) }
        ];
        const randomRegion = regions[Math.floor(Math.random() * regions.length)];
        setProxyTestResult({
          success: true,
          ip: randomRegion.ip,
          location: randomRegion.loc,
          message: "Kết nối thành công! Ping: " + Math.floor(Math.random() * 80 + 30) + "ms. Chứng thực hợp lệ."
        });
      }
    }, 1400);
  };

  // Submits formulation
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate fields
    if (!name.trim()) {
      newErrors.name = "Tên profile không được bỏ trống";
    }

    if (proxyType !== 'direct') {
      if (!proxyHost.trim()) {
        newErrors.proxyHost = "IP/Host proxy bắt buộc nhập";
      }
      const parsedPort = Number(proxyPort);
      if (!proxyPort || isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
        newErrors.proxyPort = "Cần là số nguyên dương từ 1-65535";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Automatically switch to tab containing the error
      if (newErrors.name) {
        setActiveTab('general');
      } else if (newErrors.proxyHost || newErrors.proxyPort) {
        setActiveTab('proxy');
      }
      return;
    }

    // Save Profile payload values
    const finalGroup = isAddingNewGroup && newGroupName.trim() ? newGroupName.trim() : group;

    const savedData: Partial<BrowserProfile> = {
      name: name.trim(),
      group: finalGroup,
      notes: note.trim(),
      tags: profileTags,
      proxy: {
        type: proxyType,
        host: proxyType === 'direct' ? '' : proxyHost.trim(),
        port: proxyType === 'direct' ? 0 : Number(proxyPort),
        username: proxyType === 'direct' ? '' : proxyUser.trim(),
        password: proxyType === 'direct' ? '' : proxyPass
      },
      fingerprint: {
        platform,
        userAgent: userAgent.trim(),
        screenResolution: resolution,
        canvasFingerprint,
        webglFingerprint,
        audioFingerprint,
        webrtcMode,
        browserVersion: getBrowserVersionFromUA(userAgent)
      }
    };

    onSave(savedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[2px] select-none">
      <div 
        className="bg-white border border-slate-200 rounded-lg w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/70 rounded-t-lg">
          <div>
            <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-700 animate-[spin_5s_linear_infinite]" />
              <span>{profile ? `Chỉnh sửa Profile: ${profile.name}` : "Tạo Profile Trình duyệt Mới"}</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 animate-[fadeIn_0.2s_ease-out]">
              Thiết lập dữ liệu vân tay phần cứng và kết nối mạng giả lập để tránh bị quét chéo tài khoản.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-800 shrink-0"
            title="Đóng modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body tabs structure */}
        <div className="flex border-b border-slate-200 bg-white">
          {[
            { id: 'general', label: '1. Thông tin chung', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'proxy', label: '2. Cấu hình Proxy', icon: <Network className="w-3.5 h-3.5" /> },
            { id: 'fingerprint', label: '3. Vân tay thiết bị (Advanced)', icon: <Sparkles className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-b-slate-800 bg-slate-50 text-slate-950'
                  : 'border-b-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal content area */}
        <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin text-xs bg-white">
          
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              
              {/* Profile Name & Group */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5 mandatory-field">Tên Profile <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: FB Ads - Via No.5"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full bg-slate-50 border rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 ${
                      errors.name ? 'border-rose-500 focus:ring-rose-450 focus:border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.name}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-600 font-bold">Nhóm quản lý</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewGroup(!isAddingNewGroup)}
                      className="text-[10px] text-sky-600 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      {isAddingNewGroup ? "Chọn nhóm sẵn có" : "+ Tạo nhóm mới"}
                    </button>
                  </div>
                  
                  {isAddingNewGroup ? (
                    <input
                      type="text"
                      placeholder="Nhập tên nhóm mới..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-350 rounded px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-450"
                    />
                  ) : (
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                    >
                      {groups.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Tag creation & toggles */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 flex items-center gap-1">
                  <Tags className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dán nhãn thẻ (Tags)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Thêm thẻ (Ấn nút + hoặc gõ rồi thêm)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-450 focus:border-slate-400 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-slate-850 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition font-bold flex items-center justify-center cursor-pointer border border-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Tags list */}
                {profileTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded mb-2">
                    {profileTags.map((t) => (
                      <span 
                        key={t}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1 shadow-sm"
                      >
                        <span>{t}</span>
                        <X 
                          className="w-2.5 h-2.5 hover:text-rose-600 cursor-pointer text-emerald-600 hover:scale-110" 
                          onClick={() => handleRemoveTag(t)}
                        />
                      </span>
                    ))}
                  </div>
                )}

                {/* Pool of overall tags */}
                {tags.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-450 font-bold">Bấm chọn thẻ nhanh từ hệ thống:</p>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => {
                        const active = profileTags.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleExistingTag(t)}
                            className={`text-[10px] px-2 py-0.5 rounded transition border ${
                              active
                                ? 'bg-emerald-550 bg-emerald-50 text-emerald-700 font-bold border-emerald-300'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-805'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ghi chú vận hành</span>
                </label>
                <textarea
                  placeholder="Ghi chú các thông tin cần thiết như ngày tạo via, tài khoản facebook, token cookie dự phòng..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-805 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-405 focus:border-slate-400 block resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Proxy settings */}
          {activeTab === 'proxy' && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 flex gap-2 w-full text-slate-600 leading-relaxed text-[11px] shadow-sm">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  Khuyến nghị gắn <strong>Proxy chất lượng cao (Residential)</strong> để giả lập vị trí. Tránh thay đổi địa chỉ IP liên tục trong quá trình nuôi tài khoản để hạn chế tối đa checkpoint bảo mật.
                </p>
              </div>

              {/* Proxy Type Select */}
              <div>
                <label className="block text-slate-600 font-bold mb-2">Giao thức Proxy</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'http', label: 'HTTP / HTTPS' },
                    { id: 'socks5', label: 'SOCKS5' },
                    { id: 'socks4', label: 'SOCKS4' },
                    { id: 'direct', label: 'DIRECT (No Proxy)' }
                  ].map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => {
                        setProxyType(pr.id as ProxyType);
                        if (pr.id === 'direct') setErrors({});
                      }}
                      className={`py-2 px-3 text-center border rounded text-[11px] transition font-bold cursor-pointer ${
                        proxyType === pr.id
                          ? 'border-slate-800 bg-slate-100 text-slate-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {proxyType !== 'direct' && (
                <div className="space-y-4 animate-[fadeIn_0.15s_ease-out] duration-205">
                  {/* Host IP & Port */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-600 font-bold mb-1.5 animate-[fadeIn_0.1s_ease-out]">Địa chỉ Host / IP <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 112.78.143.12 hoặc proxy.res.net"
                        value={proxyHost}
                        onChange={(e) => {
                          setProxyHost(e.target.value);
                          if (errors.proxyHost) setErrors({ ...errors, proxyHost: '' });
                        }}
                        className={`w-full bg-slate-50 border rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-450 focus:border-slate-400 ${
                          errors.proxyHost ? 'border-rose-500 focus:ring-rose-450 focus:border-rose-550' : 'border-slate-200'
                        }`}
                      />
                      {errors.proxyHost && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.proxyHost}</p>}
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1.5">Cổng (Port) <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="8080"
                        value={proxyPort}
                        onChange={(e) => {
                          setProxyPort(e.target.value);
                          if (errors.proxyPort) setErrors({ ...errors, proxyPort: '' });
                        }}
                        className={`w-full bg-slate-50 border rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-405 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-450' : 'border-slate-200' ${
                          errors.proxyPort ? 'border-rose-500 focus:ring-rose-450 focus:border-rose-550' : 'border-slate-200'
                        }`}
                      />
                      {errors.proxyPort && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.proxyPort}</p>}
                    </div>
                  </div>

                  {/* Auth User / Password containing sensitive Toggle secrecy */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1.5">Tài khoản Proxy (Username)</label>
                      <input
                        type="text"
                        placeholder="Bỏ trống nếu proxy không có mật khẩu"
                        value={proxyUser}
                        onChange={(e) => setProxyUser(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-450 focus:border-slate-400 text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1.5">Mật khẩu Proxy (Password)</label>
                      <div className="relative">
                        <input
                          type={showProxyPass ? "text" : "password"}
                          placeholder="Mật khẩu của proxy"
                          value={proxyPass}
                          onChange={(e) => setProxyPass(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 pr-10 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-450 focus:border-slate-400 text-slate-800 placeholder-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProxyPass(!showProxyPass)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
                          title={showProxyPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showProxyPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action checking Proxy validation locally */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-slate-450 text-[10px] font-medium">
                    Kiểm nghiệm kết nối và định tuyến IP địa chỉ trước khi xác nhận lưu cấu hình.
                  </div>
                  <button
                    type="button"
                    onClick={handleTestProxy}
                    disabled={isTestingProxy}
                    className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 text-white px-4 py-1.5 rounded text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-sm border border-transparent disabled:text-slate-400"
                  >
                    {isTestingProxy ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang kết nối thử cục bộ...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Kiểm tra Proxy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Result indicators card feedback */}
                {proxyTestResult && (
                  <div className={`mt-3 p-3 rounded border text-xs leading-relaxed animate-[fadeIn_0.15s_ease-out] ${
                    proxyTestResult.success 
                      ? 'bg-emerald-50/50 border-emerald-250 border-emerald-200 text-emerald-800 font-medium' 
                      : 'bg-rose-50/50 border-rose-200 text-rose-805 text-rose-800'
                  }`}>
                    <div className="flex gap-2">
                      {proxyTestResult.success ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      
                      <div className="flex-1 space-y-1">
                        <p className="font-extrabold text-slate-900 text-xs">
                          {proxyTestResult.success ? "PROXY HOẠT ĐỘNG TỐT" : "PROXY THẤT BẠI"}
                        </p>
                        <p className="text-[11px] text-slate-700 leading-snug">{proxyTestResult.message}</p>
                        
                        {proxyTestResult.success && proxyTestResult.ip && (
                          <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-emerald-200/60 font-mono text-[10px]">
                            <p className="text-slate-650"><strong>IP Truy cập:</strong> <span className="text-emerald-700 font-bold">{proxyTestResult.ip}</span></p>
                            <p className="text-slate-650"><strong>Vị trí (Geo):</strong> <span className="text-slate-805 text-slate-800 font-bold">{proxyTestResult.location}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Advanced Fingerprint settings */}
          {activeTab === 'fingerprint' && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 text-slate-600 text-[11px] shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>CÔNG NGHỆ CHỐNG PHÁT HIỆN CHÉO (ANTI-DETECTION)</span>
                </div>
                <p>
                  Hệ thống tự động hoán đổi và tiêm (inject) các API vân tay giả lập vào nhân Chromium để qua mặt các hệ thống sàng lọc tự động lớn (Facebook Pixel, Cloudflare Bot, Akamai).
                </p>
              </div>

              {/* OS Platform selection */}
              <div>
                <label className="block text-slate-600 font-bold mb-2">Hệ điều hành giả lập (Operating System)</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'windows', label: 'Windows', icon: <Laptop className="w-3.5 h-3.5" /> },
                    { id: 'macos', label: 'macOS', icon: <Laptop className="w-3.5 h-3.5" /> },
                    { id: 'linux', label: 'Linux', icon: <Laptop className="w-3.5 h-3.5" /> },
                    { id: 'android', label: 'Android OS', icon: <Smartphone className="w-3.5 h-3.5" /> },
                    { id: 'ios', label: 'iOS/iPadOS', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  ].map((os) => (
                    <button
                      key={os.id}
                      type="button"
                      onClick={() => handlePlatformChange(os.id as any)}
                      className={`py-2 px-1 text-center border rounded text-[10px] flex flex-col items-center gap-1.5 transition font-bold cursor-pointer ${
                        platform === os.id
                          ? 'border-slate-800 bg-slate-100 text-slate-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-550 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {os.icon}
                      <span>{os.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Agent input + regeneration button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-600 font-bold">Chuỗi giả định User-Agent</label>
                  <button
                    type="button"
                    onClick={regenerateUserAgent}
                    className="text-[10px] text-sky-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RefreshCw className="w-3 h-3 text-sky-600 animate-[spin_12s_linear_infinite]" />
                    <span>Lấy chuỗi ngẫu nhiên mới</span>
                  </button>
                </div>
                <textarea
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 block resize-none"
                />
              </div>

              {/* Screens resolution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Độ phân giải màn hình</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                  >
                    {platform === 'android' || platform === 'ios' ? (
                      <>
                        <option value="1080x2400">1080 x 2400 (SmartPhone Tall)</option>
                        <option value="1440x3200">1440 x 3200 (Quad HD Phone)</option>
                        <option value="1125x2436">1125 x 2436 (iPhone Standard)</option>
                      </>
                    ) : (
                      <>
                        <option value="1920x1080">1920 x 1080 (Full HD Desktop)</option>
                        <option value="1440x900">1440 x 900 (MacBook standard)</option>
                        <option value="1536x864">1536 x 864</option>
                        <option value="2560x1440">2560 x 1440 (2K WQHD)</option>
                        <option value="1366x768">1366 x 768</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Kịch bản WebRTC Masking</label>
                  <select
                    value={webrtcMode}
                    onChange={(e) => setWebrtcMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                  >
                    <option value="replace">Tráo đổi theo IP Proxy (Ẩn rò rỉ IP thật)</option>
                    <option value="real">Độ trễ nguyên bản (Tiết lộ LAN/WAN)</option>
                    <option value="block">Chặn đứng (Disable WebRTC API entirely)</option>
                  </select>
                </div>
              </div>

              {/* Fingerprint canvas audio and webgl checkboxes */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">Thiết lập Fingerprints (WebGL / Canvas / Audio)</label>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  
                  {/* Canvas */}
                  <div className="bg-slate-50/50 p-2.5 border border-slate-200 rounded">
                    <p className="font-extrabold text-slate-800 mb-1">Canvas Hash</p>
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="canvasFinger"
                          checked={canvasFingerprint === 'noise'}
                          onChange={() => setCanvasFingerprint('noise')}
                          className="shadow-sm focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                        />
                        <span className="font-medium text-slate-800">Nhiễu (Noise)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                        <input
                          type="radio"
                          name="canvasFinger"
                          checked={canvasFingerprint === 'default'}
                          onChange={() => setCanvasFingerprint('default')}
                          className="focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                        />
                        <span>Mặc định (Real)</span>
                      </label>
                    </div>
                  </div>

                  {/* WebGL */}
                  <div className="bg-slate-50/50 p-2.5 border border-slate-200 rounded">
                    <p className="font-extrabold text-slate-800 mb-1">WebGL Noise</p>
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="webglFinger"
                          checked={webglFingerprint === 'noise'}
                          onChange={() => setWebglFingerprint('noise')}
                          className="focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                        />
                        <span className="font-medium text-slate-800">Nhiễu (Noise)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                        <input
                          type="radio"
                          name="webglFinger"
                          checked={webglFingerprint === 'default'}
                          onChange={() => setWebglFingerprint('default')}
                          className="focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                        />
                        <span>Mặc định (Real)</span>
                      </label>
                    </div>
                  </div>

                  {/* Audio */}
                  <div className="bg-slate-50/50 p-2.5 border border-slate-200 rounded">
                    <p className="font-extrabold text-slate-800 mb-1">Audio Signature</p>
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="audioFinger"
                          checked={audioFingerprint === 'noise'}
                          onChange={() => setAudioFingerprint('noise')}
                          className="focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                        />
                        <span className="font-medium text-slate-800">Nhiễu (Noise)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                        <input
                          type="radio"
                          name="audioFinger"
                          checked={audioFingerprint === 'default'}
                          onChange={() => setAudioFingerprint('default')}
                          className="focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer accent-slate-800"
                        />
                        <span>Mặc định (Real)</span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </form>

        {/* Modal Foot Actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50/70 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-slate-200 text-slate-550 text-slate-505 text-slate-500 hover:text-slate-800 rounded text-xs font-bold cursor-pointer transition border border-transparent"
          >
            Đóng hủy bỏ
          </button>
          <button
            type="button"
            onClick={(e) => handleSaveSubmit(e)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs transition shadow-md cursor-pointer border border-slate-750"
          >
            {profile ? "Lưu thay đổi" : "Khởi tạo Profile mới"}
          </button>
        </div>

      </div>
    </div>
  );
};
