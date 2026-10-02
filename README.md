# 🌌 MY MUSIC HUB - Cyberpunk Personal Music Player

Trang web nghe nhạc cá nhân hiện đại theo phong cách **Dark Cyberpunk / Nocturnal Lo-Fi** (nền đen sâu, viền neon tím/cyan, kính mờ frosted glassmorphism), tối ưu 100% để deploy miễn phí lên **Vercel** và sử dụng **Supabase PostgreSQL** làm cơ sở dữ liệu.

---

## 🌟 Tính Năng Nổi Bật

1. **Hiệu Ứng Vũ Trụ Sao Trời (Animated Starfield Canvas)**:
   - 180+ ngôi sao lấp lánh (twinkle effect) trôi nổi tự nhiên.
   - Vệt sao băng (shooting stars) bay ngang màn hình tối ưu bằng `requestAnimationFrame`.
   - Vệt mây ngân hà (Cosmic Dust Nebula) chuyển động mờ ảo.
2. **Trình Phát Nhạc Cố Định (Bottom Player Bar)**:
   - Tích hợp `react-player` phát mượt mà từ: **YouTube**, **YouTube Music**, **SoundCloud**, và **link MP3 trực tiếp**.
   - Cột sóng âm thanh (Dual Waveform Visualizer) nhảy theo điệu nhạc với 2 dải màu Cyan & Magenta.
   - Điều khiển đầy đủ: Play/Pause neon, Tua thời gian (Seekbar), Chuyển bài (Next/Prev), Shuffle, Repeat, Chỉnh âm lượng (Volume/Mute), và Danh sách chờ (Queue).
3. **Thư Viện Bài Hát (Track Grid Responsive)**:
   - Lưới 4 cột responsive, thiết kế kính mờ bo tròn chuẩn theo ảnh mẫu.
   - Badge thể loại phong phú (Synth, Folk, Piano, Chill, Lo-Fi, Workout...).
   - Hiệu ứng phát nhạc động (Equalizer animation) ngay trên thẻ bài hát đang phát.
   - Phân trang: `Page [ 1 ] [ 2 ] of 5 [ > ] [ >> ]`.
4. **Widget Đồng Hồ Mini (Live Clock)**:
   - Hiển thị giờ điện tử (`10:18:24 PM • Wed, Sep 30`) viền phát sáng, chống hoàn toàn lỗi Hydration của Next.js.
5. **Cơ Chế Bảo Mật Quản Trị (Zero-Setup Master Password Auth)**:
   - Sử dụng biến môi trường duy nhất: `ADMIN_PASSWORD`.
   - Cookie HTTP-only ký bảo mật (HMAC SHA-256) an toàn 100% trước XSS.
   - Khách (Public) tự do nghe nhạc, tìm kiếm, lọc thể loại.
   - Admin mới có quyền dán link thêm bài hát hoặc xoá bài hát.
6. **Tự Động Bóc Tách Metadata (Zero-Config oEmbed)**:
   - Dán URL YouTube/YouTube Music bất kỳ, hệ thống tự động bóc tách: Tên bài hát, Nghệ sĩ/Kênh, và Ảnh đại diện (Thumbnail HD) mà không cần nhập tay hay đăng ký API Key.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### 1. Khởi động dự án:
```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

### 2. Mật khẩu Admin mặc định:
- Mật khẩu: `admin` (hoặc cấu hình trong file `.env.local` qua biến `ADMIN_PASSWORD`).
- Nhấn nút **"Admin Mode"** ở góc trái dưới thanh Sidebar hoặc nút **"+ Add Track"** để mở modal đăng nhập.

---

## 🗄️ Thiết Lập Database Supabase

1. Đăng nhập vào [Supabase](https://supabase.com) (hoàn toàn miễn phí).
2. Tạo một Project mới (ví dụ: `my-music-hub`).
3. Vào mục **SQL Editor** trong thanh menu trái.
4. Mở file [supabase/schema.sql](./supabase/schema.sql) trong dự án này, copy toàn bộ nội dung và dán vào SQL Editor của Supabase rồi nhấn **Run**.
5. Script sẽ tự động:
   - Tạo bảng `tracks` với đầy đủ cấu trúc UUID, title, artist, source_url, thumbnail_url, genre, created_at.
   - Tạo Index tăng tốc tìm kiếm và sắp xếp.
   - Kích hoạt Row Level Security (RLS) cho phép khách đọc bài hát tự do.
   - Chèn sẵn 15 bài hát mẫu chất lượng cao.
6. Vào **Project Settings** -> **API**, sao chép:
   - `Project URL`
   - `anon public` key
   - `service_role` secret key (nếu cần)
7. Dán vào file `.env.local`:
```env
ADMIN_PASSWORD=mat_khau_cua_ban
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ☁️ Hướng Dẫn Triển Khai Miễn Phí Lên Vercel

1. **Đẩy mã nguồn lên GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete cyberpunk personal music hub"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/mymusic.git
   git push -u origin main
   ```
2. **Deploy lên Vercel**:
   - Truy cập [Vercel](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
   - Nhấn **"Add New Project"** -> Chọn repository `mymusic`.
   - Tại mục **Environment Variables**, thêm các biến sau:
     * `ADMIN_PASSWORD`: Mật khẩu quản trị web của bạn.
     * `NEXT_PUBLIC_SUPABASE_URL`: Đường dẫn URL từ Supabase.
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key từ Supabase.
     * `SUPABASE_SERVICE_ROLE_KEY`: Service role key từ Supabase.
   - Nhấn **Deploy**! Vercel sẽ tự động build và cấp cho bạn một domain HTTPS miễn phí dạng `https://mymusic-tenban.vercel.app`.

---

## 📁 Cấu Trúc Mã Nguồn

```text
mymusic/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── check/route.ts       # Kiểm tra phiên đăng nhập admin
│   │   │   │   ├── login/route.ts       # Xác thực master password & set HTTP-only cookie
│   │   │   │   └── logout/route.ts      # Đăng xuất quản trị
│   │   │   └── tracks/
│   │   │       ├── add/route.ts         # Thêm track & bóc tách oEmbed metadata
│   │   │       ├── [id]/route.ts        # Xoá track (yêu cầu quyền Admin)
│   │   │       └── route.ts             # Danh sách bài hát (search, filter, sort)
│   │   ├── globals.css                  # Theme Cyberpunk, thanh cuộn neon, hiệu ứng glow
│   │   ├── layout.tsx                   # Root Layout chuẩn Next.js
│   │   └── page.tsx                     # Trang chủ tổng hợp State, Header, Grid, Player
│   ├── components/
│   │   ├── AddPlaylistModal.tsx         # Modal tạo Playlist cá nhân
│   │   ├── AddTrackModal.tsx            # Form dán link YouTube/MP3 & chọn thể loại
│   │   ├── AdminLoginModal.tsx          # Modal nhập Master Password
│   │   ├── BottomPlayer.tsx             # Player cố định đáy màn hình kèm Dual Waveform
│   │   ├── Header.tsx                   # Header gồm Search, Sort, Clock & Add Track
│   │   ├── LiveClock.tsx                # Đồng hồ kỹ thuật số chống lỗi Hydration
│   │   ├── Sidebar.tsx                  # Thanh điều hướng trái, danh mục & Admin Mode
│   │   ├── StarfieldBackground.tsx      # Canvas sao trời 180+ ngôi sao & sao băng
│   │   ├── TrackCard.tsx                # Thẻ bài hát kính mờ chuẩn theo ảnh mẫu
│   │   └── TrackGrid.tsx                # Lưới bài hát 4 cột và thanh phân trang
│   ├── lib/
│   │   ├── auth.ts                      # Cơ chế tạo và xác minh token cookie HMAC
│   │   ├── initialTracks.ts             # 15 bài hát ban đầu demo đúng theo ảnh mẫu
│   │   ├── supabase.ts                  # Supabase Client khởi tạo an toàn
│   │   └── trackStorage.ts              # Lớp dữ liệu hợp nhất (Supabase + memory fallback)
│   ├── store/
│   │   ├── useAdminStore.ts             # Zustand Store quản lý trạng thái Admin & Modals
│   │   └── usePlayerStore.ts            # Zustand Store quản lý phát nhạc, âm lượng, danh sách
│   └── types/
│       └── track.ts                     # TypeScript Type Definitions
├── supabase/
│   └── schema.sql                       # Toàn bộ SQL tạo bảng, indexes, RLS & seed data
├── .env.local.example                   # Mẫu cấu hình biến môi trường
└── README.md                            # Hướng dẫn chi tiết
```
