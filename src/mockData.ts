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

export const MOCK_CHANNELS = [
  {
    id: "chan-1",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
    title: "Bí Ẩn Lịch Sử Việt Nam",
    groupName: "Kênh Lịch Sử",
    subscriberCount: 245000,
    viewCount: 12800000,
    incompleteVideosCount: 4,
    completedVideosCount: 22
  },
  {
    id: "chan-2",
    avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&auto=format&fit=crop&q=60",
    title: "Yoga & Sức Khỏe YogaLife",
    groupName: "Kênh Đời Sống",
    subscriberCount: 89300,
    viewCount: 1950000,
    incompleteVideosCount: 2,
    completedVideosCount: 14
  },
  {
    id: "chan-3",
    avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=60",
    title: "Khám Phá Thiên Văn Học",
    groupName: "Kênh Khoa Học",
    subscriberCount: 520000,
    viewCount: 35400000,
    incompleteVideosCount: 6,
    completedVideosCount: 48
  }
];

export const MOCK_VIDEOS = [
  {
    id: "vid-1",
    status: "uploaded_to_channel",
    title: "Bí mật triều đại Tây Sơn - Cuộc hành quân thần tốc của Hoàng đế Quang Trung",
    thumbnailUrl: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=400&auto=format&fit=crop&q=80",
    youtubeVideoId: "dQw4w9WgXcQ",
    resolution: "1920x1080",
    voice: "voicevox",
    hasVideo: true,
    hasAudio: true,
    hasSubtitle: true,
    hasThumbnail: true,
    hasContent: true,
    hasTitle: true,
    hasThumbnailText: true,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T10:30:00.000Z",
    transcript: "Kính chào quý vị, hôm nay chúng ta cùng ngược dòng lịch sử về thế kỷ 18 để tìm hiểu về cuộc hành quân đại phá quân Thanh có một không hai của vua Quang Trung...",
    description: "Khám phá chi tiết chiến dịch đại phá 29 vạn quân Thanh hùng hậu của anh hùng áo vải Tây Sơn Nguyễn Huệ. Tư liệu chân thực, thiết kế đồ họa 3D sống động.",
    content: "Chi tiết toàn bộ chiến dịch Tây Sơn, bản đồ hành quân từ Phú Xuân ra Thăng Long, sơ đồ trận đánh Ngọc Hồi - Đống Đa.",
    thumbnailText: "ĐẠI PHÁ QUÂN THANH",
    viThumbnailText: "BÍ MẬT HÀNH QUÂN THẦN TỐC",
    channelId: "chan-1",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "vid-2",
    status: "rendering",
    title: "Tại sao Quang Trung đột ngột băng hà? Bí ẩn lịch sử chưa có lời giải",
    thumbnailUrl: "https://images.unsplash.com/photo-1543157145-f78b636d023d?w=400&auto=format&fit=crop&q=80",
    youtubeVideoId: "",
    resolution: "1920x1080",
    voice: "google_voice",
    hasVideo: false,
    hasAudio: true,
    hasSubtitle: false,
    hasThumbnail: true,
    hasContent: true,
    hasTitle: true,
    hasThumbnailText: true,
    createdAt: "2026-06-05T14:20:00.000Z",
    updatedAt: "2026-06-05T16:00:00.000Z",
    transcript: "Cái chết đột ngột của hoàng đế Quang Trung ở tuổi 40 vẫn luôn là một trong những bí ẩn lớn nhất của lịch sử Việt Nam. Có giả thuyết cho rằng ngài bị bạo bệnh, có thuyết nói bị đầu độc...",
    description: "Video phân tích các giả thuyết lịch sử về sự ra đi bất ngờ của vua Quang Trung giữa lúc đại nghiệp đang dang dở.",
    content: "Kịch bản chi tiết tổng hợp từ Đại Nam Thực Lục và các ghi chép của giáo sĩ phương Tây.",
    thumbnailText: "VÌ SAO BĂNG HÀ ĐỘT NGỘT?",
    viThumbnailText: "BÍ ẨN CÁI CHẾT VUA QUANG TRUNG",
    channelId: "chan-1",
    videoUrl: ""
  },
  {
    id: "vid-3",
    status: "prepare",
    title: "15 Phút Yoga kéo giãn toàn thân cho người mới bắt đầu",
    thumbnailUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&auto=format&fit=crop&q=80",
    youtubeVideoId: "",
    resolution: "1280x720",
    voice: "voice_clone",
    hasVideo: false,
    hasAudio: false,
    hasSubtitle: false,
    hasThumbnail: false,
    hasContent: true,
    hasTitle: true,
    hasThumbnailText: false,
    createdAt: "2026-06-06T00:10:00.000Z",
    updatedAt: "2026-06-06T01:00:00.000Z",
    transcript: "Chào mừng các bạn đến với chuỗi bài tập Yoga phục hồi tại nhà. Hôm nay chúng ta sẽ thực hiện các động tác kéo giãn cơ bản giúp lưu thông khí huyết và giảm đau mỏi...",
    description: "Bài tập đơn giản 15 phút kéo giãn cơ xương khớp, rất phù hợp cho nhân viên văn phòng và người chưa từng tập Yoga.",
    content: "Động tác 1: Tư thế em bé (Child Pose). Động tác 2: Tư thế bò-mèo. Động tác 3: Chó úp mặt.",
    thumbnailText: "YOGA 15 PHÚT MỖI NGÀY",
    viThumbnailText: "KÉO GIÃN TOÀN THÂN CỰC DỄ",
    channelId: "chan-2",
    videoUrl: ""
  },
  {
    id: "vid-4",
    status: "preparing_upload_to_channel",
    title: "Review 7 ngày ăn sạch thanh lọc mỡ nội tạng: Kết quả bất ngờ",
    thumbnailUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop&q=80",
    youtubeVideoId: "",
    resolution: "1920x1080",
    voice: "google_voice",
    hasVideo: true,
    hasAudio: true,
    hasSubtitle: true,
    hasThumbnail: true,
    hasContent: true,
    hasTitle: true,
    hasThumbnailText: true,
    createdAt: "2026-06-03T09:00:00.000Z",
    updatedAt: "2026-06-04T11:22:00.000Z",
    transcript: "Ăn sạch có thực sự giúp giảm mỡ nội tạng hay chỉ là xu hướng nhất thời? Chúng tôi đã kiểm chứng kết quả lâm sàng sau 7 ngày áp dụng nghiêm ngặt chế độ Eat Clean...",
    description: "Nhật ký chi tiết quá trình thay đổi chỉ số sinh hóa và cân nặng thông qua chế độ thực dưỡng tươi sống lành mạnh.",
    content: "Thực đơn ngày 1 đến ngày 7. Danh sách mua sắm nguyên liệu chuẩn Organic.",
    thumbnailText: "7 NGÀY ĂN SẠCH THẬT SỰ",
    viThumbnailText: "DIỆT MỠ NỘI TẠNG HIỆU QUẢ",
    channelId: "chan-2",
    videoUrl: ""
  },
  {
    id: "vid-5",
    status: "uploaded_to_channel",
    title: "Vũ trụ có thực sự vô hạn? Giới hạn của kính viễn vọng James Webb",
    thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop&q=80",
    youtubeVideoId: "mN3zS9wS34g",
    resolution: "1920x1080",
    voice: "voicevox",
    hasVideo: true,
    hasAudio: true,
    hasSubtitle: true,
    hasThumbnail: true,
    hasContent: true,
    hasTitle: true,
    hasThumbnailText: true,
    createdAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-05-20T14:45:00.000Z",
    transcript: "Nhìn sâu vào bức tranh vũ trụ nguyên sơ sơ khai, chúng ta tự hỏi: Vạn vật bắt đầu từ đâu và kết thúc ở đâu? Hôm nay, những bức ảnh mới nhất từ James Webb sẽ cho chúng ta câu trả lời...",
    description: "Phát hiện kinh ngạc mới nhất về thiên hà cổ đại thách thức lý thuyết Big Bang. Cận cảnh không gian sâu thẳm ngoài vũ trụ.",
    content: "Sách viết kịch bản chi tiết từ Viện Vật lý Thiên văn Hoa Kỳ, dịch nghĩa khoa học chính xác.",
    thumbnailText: "VŨ TRỤ VÔ HẠN?",
    viThumbnailText: "ẢNH MỚI NHẤT TỪ JAMES WEBB",
    channelId: "chan-3",
    videoUrl: "https://www.youtube.com/watch?v=mN3zS9wS34g"
  },
  {
    id: "vid-6",
    status: "pending",
    title: "Chuyện gì xảy ra nếu bạn rơi vào Hố Đen Vũ Trụ?",
    thumbnailUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&auto=format&fit=crop&q=80",
    youtubeVideoId: "",
    resolution: "1920x1080",
    voice: "voicevox",
    hasVideo: false,
    hasAudio: false,
    hasSubtitle: false,
    hasThumbnail: false,
    hasContent: false,
    hasTitle: true,
    hasThumbnailText: false,
    createdAt: "2026-06-05T23:50:00.000Z",
    updatedAt: "2026-06-06T00:05:00.000Z",
    transcript: "Giả sử bạn đang trôi lơ lửng ngoài không gian và đột ngột bị hút vào chân trời sự kiện của một hố đen siêu khối lượng. Cơ thể bạn sẽ bị kéo giãn ra thành 'sợi mỳ Ý'...",
    description: "Giải mã hiệu ứng Spaghettification vật lý và sự bẻ cong của không gian - thời gian khi tiếp cận vùng hấp dẫn cực hạn.",
    content: "",
    thumbnailText: "DỰ ĐOÁN RƠI HỐ ĐEN",
    viThumbnailText: "LÝ THUYẾT BẺ CONG THỜI GIAN",
    channelId: "chan-3",
    videoUrl: ""
  }
];

