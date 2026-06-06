/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProxyType = 'http' | 'socks5' | 'socks4' | 'direct';

export interface ProxyConfig {
  type: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export type ProfileStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export interface FingerprintConfig {
  userAgent: string;
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios';
  browserVersion: string;
  screenResolution: string;
  canvasFingerprint: 'noise' | 'default' | 'block';
  webglFingerprint: 'noise' | 'default';
  audioFingerprint: 'noise' | 'default';
  webrtcMode: 'replace' | 'real' | 'block';
}

export interface BrowserProfile {
  id: string;
  name: string;
  group: string;
  proxy: ProxyConfig;
  tags: string[];
  status: ProfileStatus;
  statusMessage?: string;
  lastLaunch?: string; // ISO string
  notes: string;
  cookiesCount: number;
  diskSize: string;
  fingerprint: FingerprintConfig;
  isRunningForMs?: number; // Active time counter mockup
  pid?: number; // Process ID mockup
  port?: number; // Local debugging port mockup
}

export interface ActivityLog {
  id: string;
  timestamp: string; // HH:mm:ss
  profileName: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export type VideoStatus = 'prepare' | 'pending' | 'rendering' | 'preparing_upload_to_channel' | 'failed_to_upload_to_channel' | 'uploaded_to_channel' | 'uploading';
export type VideoResolution = '1920x1080' | '1280x720';
export type VideoVoice = 'voicevox' | 'google_voice' | 'voice_clone';

export interface Channel {
  id: string;
  avatar: string;
  title: string;
  groupName: string;
  subscriberCount: number;
  viewCount: number;
  incompleteVideosCount: number;
  completedVideosCount: number;
}

export interface Video {
  id: string;
  status: VideoStatus;
  title: string;
  thumbnailUrl: string;
  youtubeVideoId: string;
  resolution: VideoResolution;
  voice: VideoVoice;
  hasVideo: boolean;
  hasAudio: boolean;
  hasSubtitle: boolean;
  hasThumbnail: boolean;
  hasContent: boolean;
  hasTitle: boolean;
  hasThumbnailText: boolean;
  createdAt: string;
  updatedAt: string;
  transcript: string;
  description: string;
  content: string;
  thumbnailText: string;
  viThumbnailText: string;
  channelId: string;
  videoUrl: string;
}

