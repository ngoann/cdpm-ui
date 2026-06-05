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
