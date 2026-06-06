/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tv,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Play,
  Loader2,
  Mic,
  Clapperboard,
  Edit2,
  Save,
  Check,
  Globe,
  Plus,
  Trash2,
  Users,
  Eye,
  Video,
  Volume2,
  Type,
  FileText,
  Image,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { Channel, Video as VideoType, VideoStatus, VideoResolution, VideoVoice } from '../types';

interface VideoManagerProps {
  initialChannels: Channel[];
  initialVideos: VideoType[];
  addToast: (type: 'success' | 'danger' | 'warning' | 'info', message: string, title?: string) => void;
  addSystemLog?: (profileName: string, type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const VideoManager: React.FC<VideoManagerProps> = ({
  initialChannels,
  initialVideos,
  addToast,
  addSystemLog
}) => {
  // --- Persistent State for Channels & Videos ---
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('cdpm_channels');
    return saved ? JSON.parse(saved) : initialChannels;
  });

  const [videos, setVideos] = useState<VideoType[]>(() => {
    const saved = localStorage.getItem('cdpm_videos');
    return saved ? JSON.parse(saved) : initialVideos;
  });

  // Track channels and videos in localStorage
  useEffect(() => {
    localStorage.setItem('cdpm_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('cdpm_videos', JSON.stringify(videos));
  }, [videos]);

  // --- Active Selections ---
  const [selectedChannelId, setSelectedChannelId] = useState<string>(() => {
    return channels[0]?.id || '';
  });

  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  // --- Search & Filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [missingAssetFilter, setMissingAssetFilter] = useState<string>('all');

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Quick Edit Draft State ---
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState<VideoStatus>('prepare');
  const [editResolution, setEditResolution] = useState<VideoResolution>('1920x1080');
  const [editVoice, setEditVoice] = useState<VideoVoice>('voicevox');
  const [isSaving, setIsSaving] = useState(false);

  // --- Confirmation Dialog Modal State ---
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

  // Selected Channel Object
  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannelId);
  }, [channels, selectedChannelId]);

  // Reset pagination when channel or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChannelId, searchTerm, statusFilter, missingAssetFilter]);

  // Handle selected video details and initialize edit drafts
  const activeVideo = useMemo(() => {
    if (!selectedVideoId) return null;
    return videos.find(v => v.id === selectedVideoId) || null;
  }, [videos, selectedVideoId]);

  // Sync draft states when activeVideo changes
  useEffect(() => {
    if (activeVideo) {
      setEditTitle(activeVideo.title);
      setEditStatus(activeVideo.status);
      setEditResolution(activeVideo.resolution);
      setEditVoice(activeVideo.voice);
    } else {
      setEditTitle('');
      setEditStatus('prepare');
      setEditResolution('1920x1080');
      setEditVoice('voicevox');
    }
  }, [activeVideo]);

  // --- Filter Logic ---
  const filteredVideos = useMemo(() => {
    return videos.filter(vid => {
      // 1. Channel constraint
      if (vid.channelId !== selectedChannelId) return false;

      // 2. Search Text on title, description, or transcript
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inTitle = vid.title.toLowerCase().includes(query);
        const inDesc = vid.description.toLowerCase().includes(query);
        const inTranscript = vid.transcript.toLowerCase().includes(query);
        if (!inTitle && !inDesc && !inTranscript) return false;
      }

      // 3. Status filter
      if (statusFilter !== 'all' && vid.status !== statusFilter) return false;

      // 4. Missing assets constraint
      if (missingAssetFilter !== 'all') {
        switch (missingAssetFilter) {
          case 'video': if (vid.hasVideo) return false; break;
          case 'thumbnail': if (vid.hasThumbnail) return false; break;
          case 'subtitle': if (vid.hasSubtitle) return false; break;
          case 'audio': if (vid.hasAudio) return false; break;
          case 'content': if (vid.hasContent) return false; break;
          case 'title': if (vid.hasTitle) return false; break;
          case 'thumbnail_text': if (vid.hasThumbnailText) return false; break;
          default: break;
        }
      }

      return true;
    });
  }, [videos, selectedChannelId, searchTerm, statusFilter, missingAssetFilter]);

  // --- Pagination Slice ---
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVideos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVideos, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / itemsPerPage));

  // --- Action Handlers ---
  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideo) return;
    if (!editTitle.trim()) {
      addToast('warning', 'Tiêu đề video không được để trống.', 'Dữ liệu thiếu');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const updated = videos.map(vid => {
        if (vid.id === activeVideo.id) {
          return {
            ...vid,
            title: editTitle.trim(),
            status: editStatus,
            resolution: editResolution,
            voice: editVoice,
            updatedAt: new Date().toISOString()
          };
        }
        return vid;
      });

      // Recalculate channel completed / incomplete video counts
      const updatedChannels = channels.map(chan => {
        const chanVids = updated.filter(v => v.channelId === chan.id);
        const completed = chanVids.filter(v => v.status === 'uploaded_to_channel').length;
        const incomplete = chanVids.length - completed;
        return {
          ...chan,
          completedVideosCount: completed,
          incompleteVideosCount: incomplete
        };
      });

      setVideos(updated);
      setChannels(updatedChannels);
      setIsSaving(false);
      addToast('success', `Đã cập nhật cấu hình video "${editTitle.length > 30 ? editTitle.substring(0, 30) + '...' : editTitle}" thành công.`, 'Lưu video');
      if (addSystemLog) {
        addSystemLog('Hệ thống Video', 'success', `[Quick Edit] Đã chỉnh sửa thông tin video ID: ${activeVideo.id}. Trạng thái: ${editStatus}`);
      }
    }, 450);
  };

  // Status Style Maps
  const getStatusStyle = (status: VideoStatus) => {
    switch (status) {
      case 'uploaded_to_channel':
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', label: 'Đã tải lên' };
      case 'preparing_upload_to_channel':
        return { bg: 'bg-teal-50 border-teal-200 text-teal-800', label: 'Chuẩn bị tải lên' };
      case 'rendering':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-800', label: 'Đang Render' };
      case 'prepare':
        return { bg: 'bg-slate-100 border-slate-200 text-slate-700', label: 'Chuẩn bị' };
      case 'pending':
        return { bg: 'bg-blue-50 border-blue-200 text-blue-800', label: 'Chờ duyệt' };
      case 'uploading':
        return { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', label: 'Đang tải lên' };
      case 'failed_to_upload_to_channel':
        return { bg: 'bg-rose-50 border-rose-200 text-rose-800', label: 'Lỗi tải lên' };
      default:
        return { bg: 'bg-slate-50 border-slate-200 text-slate-600', label: status };
    }
  };

  // Total subscriber and view counters helper
  const totalSubs = channels.reduce((sum, c) => sum + c.subscriberCount, 0);
  const totalViews = channels.reduce((sum, c) => sum + c.viewCount, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 font-sans select-none overflow-hidden">
      
      {/* Top statistics ribbon */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 grid grid-cols-4 gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tổng số kênh</p>
            <p className="text-sm font-black text-slate-800 font-mono mt-0.5">{channels.length} Kênh</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Người đăng ký</p>
            <p className="text-sm font-black text-slate-800 font-mono mt-0.5">{(totalSubs / 1000).toFixed(1)}k người</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Lượt xem tích lũy</p>
            <p className="text-sm font-black text-slate-800 font-mono mt-0.5">{(totalViews / 1000000).toFixed(2)}M lượt</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clapperboard className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tổng số Video</p>
            <p className="text-sm font-black text-slate-800 font-mono mt-0.5">{videos.length} clips</p>
          </div>
        </div>
      </div>

      {/* Horizontal Channels Quick Selector (Optimized Workspace) */}
      <div className="bg-slate-100/60 border-b border-slate-200 px-6 py-2 shrink-0 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-slate-200">
          <Tv className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tài khoản Kênh:</span>
        </div>
        
        {/* Horizontal scroll container */}
        <div className="flex-1 flex items-center gap-2 px-1 overflow-x-auto scrollbar-thin py-0.5">
          {channels.map((chan) => {
            const isActive = chan.id === selectedChannelId;

            return (
              <div
                key={chan.id}
                onClick={() => {
                  setSelectedChannelId(chan.id);
                  setSelectedVideoId('');
                }}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 relative group select-none ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-400 shadow-3xs font-bold'
                    : 'border-slate-200 hover:bg-white bg-slate-50/70'
                }`}
              >
                <img
                  src={chan.avatar}
                  alt={chan.title}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded object-cover bg-slate-200 shrink-0 border border-slate-150/70"
                />
                
                <div className="min-w-0 leading-none">
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide truncate max-w-[50px]">{chan.groupName}</span>
                  <h4 className="text-xs font-bold text-slate-800 truncate max-w-[130px] mt-0.5">{chan.title}</h4>
                </div>

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-250 italic shrink-0 leading-none text-right">
                  <span className="text-[9px] font-bold text-slate-600 font-mono">
                    {(chan.subscriberCount / 1000).toFixed(0)}k sub
                  </span>
                  <span className="text-slate-350">•</span>
                  <span className="text-[9px] text-emerald-600 font-bold font-mono">
                    {chan.completedVideosCount}/{chan.completedVideosCount + chan.incompleteVideosCount} clips
                  </span>
                </div>

                {/* Remove Channel Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (channels.length <= 1) {
                      addToast('warning', 'Không thể xóa kênh cuối cùng.');
                      return;
                    }
                    openConfirm(
                      'Xóa tài khoản Kênh?',
                      `Bạn thật sự muốn xóa kênh "${chan.title}"? Toàn bộ video nằm trong tài khoản kênh này cũng sẽ bị loại bỏ khỏi hệ thống.`,
                      () => {
                        setChannels(channels.filter(c => c.id !== chan.id));
                        setVideos(videos.filter(v => v.channelId !== chan.id));
                        if (selectedChannelId === chan.id) {
                          const remaining = channels.filter(c => c.id !== chan.id);
                          setSelectedChannelId(remaining[0]?.id || '');
                        }
                        addToast('info', `Đã xóa kênh "${chan.title}" thành công.`);
                      }
                    );
                  }}
                  className="p-0.5 text-slate-300 hover:text-rose-500 rounded hover:bg-slate-100 transition ml-0.5 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 duration-150"
                  title="Xóa kênh"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Create new channel action */}
        <button
          onClick={() => {
            const newChanId = `chan-${Date.now()}`;
            const newChan: Channel = {
              id: newChanId,
              avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=60",
              title: `Kênh mới #${channels.length + 1}`,
              groupName: "Mặc định",
              subscriberCount: 200,
              viewCount: 1500,
              incompleteVideosCount: 0,
              completedVideosCount: 0
            };
            setChannels([...channels, newChan]);
            setSelectedChannelId(newChanId);
            addToast('success', `Đã tạo tài khoản kênh giả lập mới: ${newChan.title}`);
          }}
          className="h-7 text-[10px] text-slate-800 hover:text-indigo-650 bg-white hover:bg-slate-100 border border-slate-200 px-2 rounded font-bold flex items-center gap-1 transition cursor-pointer shrink-0 shadow-3xs"
        >
          <Plus className="w-3 h-3" /> Thêm kênh
        </button>
      </div>

      {/* 2-Column Workspace Panel (Optimized Layout without wide left panel) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* PANEL 2: VIDEO LISTING (Center Width: Flexible, Scroll-free for the outer box, internal lists scroll) */}
        <div className="flex-1 bg-white flex flex-col min-h-0">
          
          {/* Filters & Control bar */}
          <div className="p-4 border-b border-slate-150 bg-slate-50/50 space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search text query bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm video bằng từ khóa, nội dung, transcript..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Status Select filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="prepare">Chuẩn bị (Prepare)</option>
                  <option value="pending">Chờ duyệt (Pending)</option>
                  <option value="rendering">Đang Render (Rendering)</option>
                  <option value="preparing_upload_to_channel">Chuẩn bị tải lên</option>
                  <option value="uploaded_to_channel">Đã tải lên kênh</option>
                  <option value="uploading">Đang upload (Uploading)</option>
                  <option value="failed_to_upload_to_channel">Upload lỗi</option>
                </select>
              </div>

              {/* Missing assets filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thiếu tài nguyên</span>
                <select
                  value={missingAssetFilter}
                  onChange={(e) => setMissingAssetFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Không lọc thiếu</option>
                  <option value="video">Thiếu Video</option>
                  <option value="audio">Thiếu Audio</option>
                  <option value="subtitle">Thiếu Phụ đề</option>
                  <option value="thumbnail">Thiếu Thumbnail</option>
                  <option value="content">Thiếu Cấu trúc Nội dung</option>
                  <option value="title">Thiếu Tiêu đề</option>
                  <option value="thumbnail_text">Thiếu Text hình thu nhỏ</option>
                </select>
              </div>
            </div>

            {/* Quick stats on filtered vids */}
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Đã tìm thấy <strong className="text-slate-800">{filteredVideos.length}</strong> video tương thích</span>
              </div>

              <button
                onClick={() => {
                  const clipId = `vid-${Date.now()}`;
                  const newClip: VideoType = {
                    id: clipId,
                    status: 'prepare',
                    title: `Kịch bản nháp video #${filteredVideos.length + 1} của tôi`,
                    thumbnailUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80",
                    youtubeVideoId: "",
                    resolution: "1920x1080",
                    voice: "voicevox",
                    hasVideo: false,
                    hasAudio: false,
                    hasSubtitle: false,
                    hasThumbnail: true,
                    hasContent: false,
                    hasTitle: true,
                    hasThumbnailText: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    transcript: "Đây là tệp viết lại phụ đề kịch bản ảo của bạn. Bạn hãy sửa đổi tại bảng quick-edit bên tay phải.",
                    description: "Mô tả quảng bá của video khi tiến hành nộp kênh Youtube.",
                    content: "Nội dung phân chia khung thời gian ảo.",
                    thumbnailText: "KỊCH BẢN MỚI",
                    viThumbnailText: "CHỈNH SỬA NHANH",
                    channelId: selectedChannelId,
                    videoUrl: ""
                  };
                  setVideos([newClip, ...videos]);
                  setSelectedVideoId(clipId);
                  addToast('success', `Đã ghép kịch bản video nháp vào kênh thành công.`);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo Video Nháp
              </button>
            </div>
          </div>

          {/* Table / List Area (Scroll inside, not outside) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {paginatedVideos.length === 0 ? (
              <div className="py-12 text-center text-slate-405 flex flex-col items-center justify-center space-y-2">
                <AlertTriangle className="w-10 h-10 text-slate-300" />
                <h5 className="text-xs font-black text-slate-700 uppercase">Không tìm thấy video nào</h5>
                <p className="text-xs text-slate-400 max-w-xs leading-normal">
                  Kênh này chưa có Clip nào phù hợp với bộ lọc tìm kiếm hiện hành. Hãy đổi kênh hoặc xóa các từ khóa tìm kiếm.
                </p>
              </div>
            ) : (
              paginatedVideos.map((vid) => {
                const isActive = vid.id === activeVideo?.id;
                const statusStyle = getStatusStyle(vid.status);

                return (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedVideoId(vid.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/10 shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-150 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {/* Video thumbnail mock element */}
                    <div className="w-24 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 relative group flex items-center justify-center">
                      <img
                        src={vid.thumbnailUrl}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {vid.youtubeVideoId && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-6 h-6 text-white text-emerald-500" />
                        </div>
                      )}
                      
                      {/* Resolution marker */}
                      <span className="absolute bottom-1 right-1 bg-black/75 text-[8px] font-mono font-bold text-white px-1 py-0.2 rounded leading-none">
                        {vid.resolution}
                      </span>
                    </div>

                    {/* Clip core meta fields info */}
                    <div className="flex-1 min-w-0 font-sans text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 border rounded ${statusStyle.bg}`}>
                          {statusStyle.label}
                        </span>
                        
                        {vid.youtubeVideoId && (
                          <span className="text-[9px] px-1 bg-slate-100 text-slate-500 rounded font-mono font-bold flex items-center gap-0.5" title={`YouTube ID: ${vid.youtubeVideoId}`}>
                            <Globe className="w-2.5 h-2.5 text-indigo-500" /> {vid.youtubeVideoId}
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 font-mono font-medium ml-auto">
                          {new Date(vid.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-800 truncate mt-1.5 leading-normal" title={vid.title}>
                        {vid.title}
                      </h4>

                      {/* Assets visual grid badges */}
                      <div className="flex gap-1.5 mt-2.5 flex-wrap">
                        {[
                          { name: 'Video', has: vid.hasVideo, color: 'text-rose-500' },
                          { name: 'Audio', has: vid.hasAudio, color: 'text-amber-500' },
                          { name: 'Subtitle', has: vid.hasSubtitle, color: 'text-sky-500' },
                          { name: 'Thumbnail', has: vid.hasThumbnail, color: 'text-emerald-500' },
                          { name: 'Mô tả', has: vid.hasContent, color: 'text-violet-500' },
                          { name: 'Tiêu đề', has: vid.hasTitle, color: 'text-lime-500' },
                          { name: 'Text ảnh', has: vid.hasThumbnailText, color: 'text-fuchsia-500' }
                        ].map((asset) => (
                          <span
                            key={asset.name}
                            className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${
                              asset.has
                                ? 'bg-slate-50 border-slate-200 text-slate-600 font-extrabold'
                                : 'bg-rose-50/70 border-rose-100 text-rose-500 font-black'
                            }`}
                            title={asset.has ? `Đã có ${asset.name}` : `Thiếu ${asset.name}`}
                          >
                            <span className={asset.has ? 'text-slate-400' : 'text-rose-500'}>{asset.has ? '✓' : '✗'}</span>
                            {asset.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Simple and elegant pagination section */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 font-sans text-xs select-none">
            <span className="text-slate-550 font-medium">
              Hiển thị <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredVideos.length)}</strong> trên tổng số <strong className="text-slate-800">{filteredVideos.length}</strong> videos
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 text-slate-400 hover:text-slate-800 disabled:text-slate-250 disabled:bg-transparent rounded bg-transparent border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-slate-700 font-bold bg-white border border-slate-200 px-3 py-1 rounded">
                TRANG {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 text-slate-400 hover:text-slate-800 disabled:text-slate-250 disabled:bg-transparent rounded bg-transparent border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: VIDEO DETAILS & QUICK EDIT (Right Width: 380px - Only displayed when a video is clicked) */}
        {activeVideo && (
          <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 min-h-0 overflow-y-auto">
            <div className="p-4 space-y-4 font-sans text-xs">
              
              {/* Header section */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest block mb-1">Mã tham chiếu: {activeVideo.id}</span>
                  <button
                    onClick={() => setSelectedVideoId('')}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-bold hover:bg-rose-50 px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    Đóng [X]
                  </button>
                </div>
                <h3 className="text-xs font-black text-slate-900 leading-snug">{activeVideo.title}</h3>
                
                <div className="flex gap-2 items-center mt-2 flex-wrap">
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1 py-0.2 rounded border border-slate-100">
                    Voice: <strong className="text-slate-800">{activeVideo.voice}</strong>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1 py-0.2 rounded border border-slate-100">
                    Res: <strong className="text-slate-800">{activeVideo.resolution}</strong>
                  </span>
                  {activeVideo.videoUrl && (
                    <a
                      href={activeVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-sky-600 hover:text-sky-850 hover:underline flex items-center gap-0.5 ml-auto font-bold"
                    >
                      Xem trang gốc <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Form Quick Edit Action Block */}
              <form onSubmit={handleQuickSave} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-3xs">
                <h4 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-250 pb-1.5 mb-1">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" /> CHỈNH SỬA NHANH (QUICK EDIT)
                </h4>

                {/* Edit Title */}
                <div className="space-y-0.5">
                  <label className="text-[9px] font-extrabold text-slate-405 uppercase">Cập nhật tiêu đề</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Thay đổi tiêu đề phát biểu"
                  />
                </div>

                {/* Edit Status */}
                <div className="space-y-0.5">
                  <label className="text-[9px] font-extrabold text-slate-405 uppercase">Trạng thái phát hành</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as VideoStatus)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="prepare">prepare (Chuẩn bị)</option>
                    <option value="pending">pending (Chờ duyệt)</option>
                    <option value="preparing_upload_to_channel">preparing_upload_to_channel (Chờ tải lên)</option>
                    <option value="uploaded_to_channel">uploaded_to_channel (Đã đăng tải)</option>
                  </select>
                </div>

                {/* Change Resolution */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-405 uppercase">Độ phân giải</label>
                    <select
                      value={editResolution}
                      onChange={(e) => setEditResolution(e.target.value as VideoResolution)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                    >
                      <option value="1920x1080">1920x1080 FullHD</option>
                      <option value="1280x720">1280x720 HD</option>
                    </select>
                  </div>

                  {/* Change Voice Generator AI */}
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-405 uppercase">Công nghệ Giọng đọc</label>
                    <select
                      value={editVoice}
                      onChange={(e) => setEditVoice(e.target.value as VideoVoice)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                    >
                      <option value="voicevox">VoiceVox AI V3</option>
                      <option value="google_voice">Google Cloud Voice</option>
                      <option value="voice_clone">Voice Cloning VIP</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 border border-slate-800 hover:border-slate-900 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu tinh chỉnh...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Áp dụng lưu nhanh (PUT)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Read Only Detailed Data Fields */}
              <div className="space-y-3 font-sans text-xs">
                
                {/* Transcript text block */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3 h-3 text-sky-500" /> KỊCH BẢN PHỤ ĐỀ TRỰC QUAN (TRANSCRIPT)
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[10px] leading-relaxed max-h-36 overflow-y-auto text-slate-600">
                    {activeVideo.transcript || <em className="text-slate-400">Trống (Sử dụng công cụ render giọng đọc tự động bổ sung)</em>}
                  </div>
                </div>

                {/* Description text block */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-500" /> MÔ TẢ ĐÍNH KÈM (YOUTUBE DESCRIPTION)
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] leading-relaxed max-h-24 overflow-y-auto text-slate-600">
                    {activeVideo.description || <em className="text-slate-400">Trống</em>}
                  </div>
                </div>

                {/* Thumbnail Text structure inside images */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Image className="w-3 h-3 text-indigo-500" /> Text gốc Thumbnail
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-bold text-slate-700 leading-tight">
                      {activeVideo.thumbnailText || <em className="text-slate-400 font-semibold">Chưa thiết kế</em>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 tracking-wide flex items-center gap-1">
                      🇻🇳 Text Tiếng Việt
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-bold text-slate-700 leading-tight">
                      {activeVideo.viThumbnailText || <em className="text-slate-400 font-semibold">Chưa thiết kế</em>}
                    </div>
                  </div>
                </div>

                {/* More Details metadata table */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Mốc thời gian</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1 text-[10px] font-mono text-slate-600">
                    <div className="flex justify-between">
                      <span>Cập nhật gần nhất:</span>
                      <span className="text-slate-800 font-bold">{new Date(activeVideo.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tệp video vật lý:</span>
                      {activeVideo.hasVideo ? (
                        <span className="text-emerald-600 font-bold">Đồng bộ hoàn chỉnh</span>
                      ) : (
                        <span className="text-rose-600 font-bold">Chưa tạo dựng</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Kênh chủ quản:</span>
                      <span className="text-slate-800 font-bold">{activeChannel?.title || activeVideo.channelId}</span>
                    </div>
                  </div>
                </div>

                {/* Remove draft video button */}
                <button
                  type="button"
                  onClick={() => {
                    openConfirm(
                      'Xóa kịch bản Video?',
                      'Bạn chắc chắn mong muốn loại bỏ kịch bản phân loại video này khỏi cơ sở dữ liệu ảo?',
                      () => {
                        const updated = videos.filter(v => v.id !== activeVideo.id);
                        setVideos(updated);
                        setSelectedVideoId('');
                        addToast('info', 'Đã loại bỏ clip nháp khỏi cơ sở dữ liệu ảo.');
                      }
                    );
                  }}
                  className="w-full py-1.5 mt-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Xóa video khỏi CSDL
                </button>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Confirmation Dialog Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-155 overflow-hidden transform scale-100 transition-all">
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              </div>
              <div className="space-y-1 flex-1 select-none font-sans">
                <h4 className="text-sm font-black text-slate-800 leading-snug">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
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

    </div>
  );
};
