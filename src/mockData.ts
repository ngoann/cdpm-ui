/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserProfile } from "./types";

export const INITIAL_GROUPS = [
  "Mặc định",
  "Facebook Ads Farm",
  "Dropshipping Store",
  "Airdrop Retroactive",
  "Tài khoản MMO Cá nhân"
];

export const INITIAL_TAGS = [
  "VN-Viettel",
  "US-Residential",
  "VIP",
  "Ads",
  "eBay",
  "Coin-Airdrop",
  "Live-Cookie",
  "Bị hạn chế"
];

export const INITIAL_PROFILES: BrowserProfile[] = [
  {
    id: "prof-1",
    name: "FB Ads - Clone Via Ngoại 01",
    group: "Facebook Ads Farm",
    proxy: {
      type: "socks5",
      host: "112.78.143.12",
      port: 1080,
      username: "via_foreign_u",
      password: "secure_password_socks"
    },
    tags: ["VIP", "Ads", "Live-Cookie"],
    status: "running",
    statusMessage: "Đang hoạt động ổn định",
    lastLaunch: "2026-06-05T07:15:30.000Z",
    notes: "Via gốc Philippines, dùng lên camp chính cho thị trường Đông Nam Á.",
    cookiesCount: 142,
    diskSize: "48.2 MB",
    fingerprint: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      platform: "windows",
      browserVersion: "Chrome v125",
      screenResolution: "1920x1080",
      canvasFingerprint: "noise",
      webglFingerprint: "noise",
      audioFingerprint: "noise",
      webrtcMode: "replace"
    },
    isRunningForMs: 2016000,
    pid: 14502,
    port: 9341
  },
  {
    id: "prof-2",
    name: "eBay Buyer - Acc US No.3",
    group: "Dropshipping Store",
    proxy: {
      type: "http",
      host: "45.138.83.210",
      port: 8085,
      username: "ebay_res_proxy",
      password: "pass_ebay_secure_1"
    },
    tags: ["US-Residential", "eBay"],
    status: "stopped",
    statusMessage: "Đã tắt",
    lastLaunch: "2026-06-04T18:40:12.000Z",
    notes: "Tài khoản mua hàng chính ngạch, duy trì IP tĩnh dân cư bang California.",
    cookiesCount: 310,
    diskSize: "114.5 MB",
    fingerprint: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      platform: "macos",
      browserVersion: "Chrome v126",
      screenResolution: "1440x900",
      canvasFingerprint: "noise",
      webglFingerprint: "noise",
      audioFingerprint: "default",
      webrtcMode: "replace"
    }
  },
  {
    id: "prof-3",
    name: "Airdrop Wallet - Account 09",
    group: "Airdrop Retroactive",
    proxy: {
      type: "socks5",
      host: "103.155.221.44",
      port: 9050
    },
    tags: ["Coin-Airdrop"],
    status: "error",
    statusMessage: "Lỗi Proxy: Không thể thiết lập kết nối (Connection Timeout)",
    lastLaunch: "2026-06-05T06:30:19.000Z",
    notes: "Ví MetaMask + Tài khoản Discord + Twitter cày kèo Linea.",
    cookiesCount: 15,
    diskSize: "8.5 MB",
    fingerprint: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
      platform: "windows",
      browserVersion: "Firefox v126",
      screenResolution: "1920x1080",
      canvasFingerprint: "default",
      webglFingerprint: "default",
      audioFingerprint: "default",
      webrtcMode: "real"
    }
  },
  {
    id: "prof-4",
    name: "FB Store - Page Kháng Nghị 02",
    group: "Facebook Ads Farm",
    proxy: {
      type: "socks4",
      host: "172.93.201.88",
      port: 10850,
      username: "via_support",
      password: "password_vip_1"
    },
    tags: ["VIP", "VN-Viettel"],
    status: "stopped",
    statusMessage: "Đã tắt",
    lastLaunch: "2026-06-03T11:20:00.000Z",
    notes: "Nắm quyền admin Fanpage phụ để kháng nghị trạng thái quảng cáo.",
    cookiesCount: 89,
    diskSize: "24.6 MB",
    fingerprint: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      platform: "macos",
      browserVersion: "Chrome v126",
      screenResolution: "1680x1050",
      canvasFingerprint: "noise",
      webglFingerprint: "noise",
      audioFingerprint: "noise",
      webrtcMode: "replace"
    }
  },
  {
    id: "prof-5",
    name: "Personal - Google Workspace Admin",
    group: "Tài khoản MMO Cá nhân",
    proxy: {
      type: "direct",
      host: "",
      port: 0
    },
    tags: ["VIP"],
    status: "stopped",
    statusMessage: "Sẵn sàng",
    lastLaunch: "2026-06-05T02:10:00.000Z",
    notes: "Chạy Direct bằng IP máy thật, truy cập các tài nguyên quản trị cloud.",
    cookiesCount: 1205,
    diskSize: "256.0 MB",
    fingerprint: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      platform: "windows",
      browserVersion: "Chrome v126",
      screenResolution: "2560x1440",
      canvasFingerprint: "default",
      webglFingerprint: "default",
      audioFingerprint: "default",
      webrtcMode: "real"
    }
  },
  {
    id: "prof-6",
    name: "Tạp hóa Shophouse CN 02",
    group: "Dropshipping Store",
    proxy: {
      type: "http",
      host: "91.211.89.52",
      port: 3128,
      username: "shop_shopee",
      password: "pass_shopee_secret"
    },
    tags: ["eBay", "Live-Cookie"],
    status: "stopped",
    statusMessage: "Hết hạn proxy (407 Proxy Authentication Required)",
    lastLaunch: "2026-06-05T07:44:00.000Z",
    notes: "Dùng để kiểm thử tồn kho Shopee/Lazada.",
    cookiesCount: 78,
    diskSize: "19.3 MB",
    fingerprint: {
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
      platform: "android",
      browserVersion: "Chrome v125",
      screenResolution: "1080x2400",
      canvasFingerprint: "noise",
      webglFingerprint: "noise",
      audioFingerprint: "default",
      webrtcMode: "block"
    }
  }
];
