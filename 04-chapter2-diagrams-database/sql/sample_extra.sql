-- ข้อมูลตัวอย่างเพิ่มเฉพาะ data dictionary (2.17) ให้ทุกตารางมีตัวอย่างอย่างน้อย 5 แถว
-- ไม่ใช้ใน npm run sql (2.23) ซึ่งรันบน seed.sql เท่ากับข้อมูลตั้งต้นของเว็บ
INSERT INTO suppliers (supplier_id, supplier_name, contact_info, lead_time_days, created_at) VALUES
('SUP-05', 'Yiwu Fishing Supply Co.', 'sales@yiwu-fishing.example.cn', 25, '2026-11-06 03:07:12.957+00');

INSERT INTO reorders (reorder_id, order_qty, decision, decided_at, reorder_status, ordered_at, expected_date, supplier_tracking_no, received_at, created_at, sku_id, supplier_id, supplier_request_id, supplier_reference, last_error_code, received_qty) VALUES
('PO-0087', 40, 'คุ้มค่า', '2026-08-28 02:00:00+00', 'ได้รับสินค้าแล้ว', '2026-08-28 02:05:00+00', '2026-09-18', 'SF1029384756', '2026-09-17 04:00:00+00', '2026-08-28 02:00:00+00', 'SKU-FSH-MLR-240', 'SUP-01', 'REQ-PO-0087', 'NB-77120', NULL, 40),
('PO-0088', 30, 'คุ้มค่า', '2026-09-02 03:00:00+00', 'ได้รับสินค้าแล้ว', '2026-09-02 03:05:00+00', '2026-09-12', NULL, '2026-09-11 05:00:00+00', '2026-09-02 03:00:00+00', 'SKU-YDM-HRB-012', 'SUP-02', 'REQ-PO-0088', 'TH-5521', NULL, 30),
('PO-0089', 25, 'คุ้มค่า', '2026-09-10 02:00:00+00', 'ยกเลิกแล้ว', '2026-09-10 02:05:00+00', '2026-09-28', NULL, NULL, '2026-09-10 02:00:00+00', 'SKU-HOM-STG-045', 'SUP-04', 'REQ-PO-0089', 'FS-3310', NULL, NULL),
('PO-0090', 50, 'คุ้มค่า', '2026-10-05 01:30:00+00', 'รอส่งคำสั่งซื้อ', NULL, NULL, NULL, NULL, '2026-10-05 01:30:00+00', 'SKU-FSH-RDS-180', 'SUP-01', 'REQ-PO-0090', NULL, 'external_unavailable', NULL);

INSERT INTO sessions (session_id, admin_id, token_hash, created_at, expires_at, revoked_at) VALUES
('SES-0003', 'U001', 'sha256:9c1d7e3f5a2b8c4d6e0f1a3b5c7d9e2f', '2026-10-04 00:05:00+00', '2026-10-04 12:05:00+00', NULL),
('SES-0004', 'U001', 'sha256:4e6a8c0b2d4f6a8c1e3b5d7f9a1c3e5b', '2026-10-04 08:15:00+00', '2026-10-04 20:15:00+00', '2026-10-04 10:00:00+00'),
('SES-0005', 'U001', 'sha256:1a3c5e7b9d2f4a6c8e0b1d3f5a7c9e2d', '2026-10-03 01:00:00+00', '2026-10-03 13:00:00+00', NULL);

INSERT INTO auto_error_logs (auto_error_log_id, use_case_id, context_key, error_code, safe_message, occurred_at) VALUES
('AEL-0004', '7S', 'ORD-24172', 'external_unavailable', 'Rakuten stock sync failed, will retry', '2026-10-01 06:05:00+00'),
('AEL-0005', '1S', 'ORD-24174', 'external_unavailable', 'RSL could not be reached', '2026-10-02 02:30:00+00');

INSERT INTO deletion_history (deletion_history_id, order_reference, order_snapshot, admin_id, deleted_at) VALUES
('DEL-0003', 'ORD-22952', '{"order_id": "ORD-22952", "order_status": "จัดส่งสำเร็จ", "order_date": "2025-09-22"}', 'U001', '2026-10-01 02:00:00+00'),
('DEL-0004', 'ORD-22953', '{"order_id": "ORD-22953", "order_status": "จัดส่งสำเร็จ", "order_date": "2025-09-23"}', 'U001', '2026-10-01 02:00:00+00'),
('DEL-0005', 'PO-0071', '{"reorder_id": "PO-0071", "reorder_status": "ได้รับสินค้าแล้ว", "created_at": "2025-08-30"}', 'U001', '2026-10-01 02:01:00+00');

INSERT INTO cost_history (cost_history_id, sku_id, cost_id, previous_value, new_value, admin_id, changed_at) VALUES
('CH-0003', 'SKU-OUT-CHR-003', 'COST-OUT-CHR-003', '{"exchange_rate": 4.95}', '{"exchange_rate": 5.02}', 'U001', '2026-10-03 06:00:00+00'),
('CH-0004', 'SKU-HOM-KIT-108', 'COST-HOM-KIT-108', '{"customs_duty": 1200}', '{"customs_duty": 1350}', 'U001', '2026-10-04 02:10:00+00'),
('CH-0005', 'SKU-YDM-HRB-012', 'COST-YDM-HRB-012', '{"purchase_price": 3100}', '{"purchase_price": 3250}', 'U001', '2026-10-04 03:40:00+00');

INSERT INTO tracking_notification_logs (tracking_notification_log_id, order_id, tracking_number, outcome, sent_at, admin_id, attempt_id, error_code) VALUES
('ORD-24165-NOTIFY-1', 'ORD-24165', '4418-2290-1106', 'failed', '2026-10-01 05:55:00+00', 'U001', 'ORD-24165-NOTIFY-1', 'external_unavailable');

INSERT INTO stock_adjustment_history (stock_adjustment_history_id, stock_id, previous_in_house_qty, new_in_house_qty, previous_rsl_qty, new_rsl_qty, reason, admin_id, adjusted_at) VALUES
('SAH-0003', 'STK-FSH-MLR-240', 54, 52, 96, 96, 'ส่งตัวอย่างให้ลูกค้า 2 ชิ้น', 'U001', '2026-10-04 06:20:00+00'),
('SAH-0004', 'STK-YDM-HRB-012', 120, 118, NULL, NULL, 'นับสต๊อกจริงพบขาด 2 ชิ้น', 'U001', '2026-10-04 06:30:00+00'),
('SAH-0005', 'STK-HOM-KIT-108', 0, 2, 3, 3, 'รับคืนสินค้าจากลูกค้า 2 ชิ้น', 'U001', '2026-10-04 06:40:00+00');

INSERT INTO label_print_history (label_print_history_id, print_attempt_id, label_id, admin_id, is_reprint, outcome, error_code, attempted_at) VALUES
('LPH-0004', 'PRINT-0004', 'ORD-24177-LABEL-1', 'U001', TRUE, 'printed', NULL, '2026-10-04 01:40:00+00'),
('LPH-0005', 'PRINT-0005', 'ORD-24173-LABEL-1', 'U001', FALSE, 'printed', NULL, '2026-10-04 01:45:00+00');
