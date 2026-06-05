/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProxyConfig } from "../types";

export const USER_AGENTS_POOL = {
  windows: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0"
  ],
  macos: [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  ],
  linux: [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0"
  ],
  android: [
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
  ],
  ios: [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  ]
};

export const SCREEN_RESOLUTIONS = [
  "1920x1080",
  "1440x900",
  "1536x864",
  "1366x768",
  "2560x1440",
  "1680x1050",
  "1280x720",
  "1080x2400"
];

export function getRandomUserAgent(platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios'): string {
  const pool = USER_AGENTS_POOL[platform] || USER_AGENTS_POOL.windows;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomResolution(platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios'): string {
  if (platform === 'android' || platform === 'ios') {
    return '1080x2400';
  }
  return SCREEN_RESOLUTIONS[Math.floor(Math.random() * 4)]; // standard desktop sizes
}

export function getBrowserVersionFromUA(ua: string): string {
  const chromeMatch = ua.match(/Chrome\/([0-9.]+)/);
  if (chromeMatch) return `Chrome v${chromeMatch[1].split('.')[0]}`;
  const safariMatch = ua.match(/Version\/([0-9.]+)/);
  if (safariMatch) return `Safari v${safariMatch[1].split('.')[0]}`;
  const firefoxMatch = ua.match(/Firefox\/([0-9.]+)/);
  if (firefoxMatch) return `Firefox v${firefoxMatch[1].split('.')[0]}`;
  return "Chromium v125";
}

export function formatProxy(proxy: ProxyConfig): string {
  if (proxy.type === 'direct') {
    return 'Kết nối Trực tiếp (Direct)';
  }
  let authStr = '';
  if (proxy.username) {
    authStr = `${proxy.username}:***@`;
  }
  return `${proxy.type.toUpperCase()}://${authStr}${proxy.host}:${proxy.port}`;
}

export function generateRandomPID(): number {
  return Math.floor(Math.random() * 20000) + 10000;
}

export function generateRandomPort(): number {
  return Math.floor(Math.random() * 5000) + 9000;
}

export function generateRandomSize(): string {
  const sizes = ["4.8 MB", "12.4 MB", "32.1 MB", "1.2 MB", "8.5 MB", "54.2 MB"];
  return sizes[Math.floor(Math.random() * sizes.length)];
}
