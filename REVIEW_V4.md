# JoTrip Operations - Review V4

Review URL: `https://dash.openphuquoc.com/review.html`

Mục tiêu: duyệt sâu visual + UX trước khi gộp V4 vào luồng production. Review V4 không thay đổi Weather/Airport upstream. Hai nguồn này chỉ được đọc snapshot đã publish.

## 24 màn hình

1. Command Center
2. Điều hành hôm nay
3. Exception Inbox
4. Tour Board
5. Tour Detail
6. Booking Board
7. Booking Detail
8. Khách hàng
9. Customer Profile
10. Đối tác
11. Partner Profile
12. Resource Planner
13. Nhân sự & roster
14. Staff / Host Detail
15. Bàn giao ca
16. Airport Operations
17. Tàu & phà
18. Weather & Marine
19. Bản đồ vận hành
20. Data Health
21. Báo cáo & Ops Pulse
22. Tài khoản & phân quyền
23. Cài đặt hệ thống
24. Mobile Field Mode

## Cách duyệt sáng mai

- Bắt đầu ở Desktop, duyệt 01 → 24 theo menu trái.
- Với các màn 01, 02, 05, 06, 12, 15, 18 và 24, kiểm tra thêm Tablet/Mobile bằng nút preview trên topbar.
- Bật `Notes` để xem mục tiêu và điểm cần chốt của từng màn.
- Ưu tiên phản hồi theo 4 nhóm: `KEEP`, `CHANGE`, `REMOVE`, `MISSING`.
- Chỉ sau khi chốt review mới merge cấu trúc V4 vào production shell để tránh patch chồng.

## Lock dữ liệu

- Weather & Marine: READ ONLY.
- Airport Live: READ ONLY.
- Không sửa collector, parser, snapshot, schema hoặc decision logic upstream từ Dashboard.
- Missing không được tự đổi thành 0.
- STALE phải hiện tuổi dữ liệu.
- Tàu/phà chưa có nguồn đáng tin cậy thì giữ `Chưa xác minh`.
- Dữ liệu Tour/Booking/Khách/Đối tác/Nhân sự trong Review V4 hiện là internal preview cho UX validation cho tới khi persistence + Auth/RLS được kết nối.
