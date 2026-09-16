# JoTrip Dashboard - Authentication & RBAC

Dashboard chạy trên GitHub Pages nên frontend tĩnh không thể tự tạo một lớp đăng nhập production an toàn nếu không có backend/auth provider.

## Hiện tại
- UI quản trị tài khoản và phân quyền đã có.
- Role hiện có: Administrator, Điều hành, Sales & Booking, HDV/Host, Data/Analyst, Chỉ xem, Đối tác.
- Local preview dùng localStorage để QA luồng UX và ẩn/hiện chức năng theo role.
- Local preview KHÔNG được xem là bảo mật production.

## Production lock
- Weather và Airport chỉ READ ONLY.
- Tài khoản thật phải dùng auth provider và quyền phải enforce ở backend/RLS.
- Không lưu password, service key hoặc admin secret trong repo/public JS.
- Admin mới có quyền tạo user, đổi role, khóa tài khoản.
- HDV/Host và Đối tác phải giới hạn theo phạm vi/tour được giao ở backend, không chỉ ở giao diện.

## Provider dự kiến
Config đã chuẩn bị cho Supabase Auth + RLS. Khi có Supabase project, điền URL/anon key ở config runtime và triển khai invite-user Edge Function hoặc backend tương đương để admin mời tài khoản mà không lộ service role key.
