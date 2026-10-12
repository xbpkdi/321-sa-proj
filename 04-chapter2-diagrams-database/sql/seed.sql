-- ข้อมูลตัวอย่าง ใช้ค่าเดียวกับข้อมูลตั้งต้นของเว็บ (01418321-final-project/src/mock)

INSERT INTO users (user_id, user_email, user_password, fail_attempts, last_login) VALUES
('U001', 'admin@colorado.jp',   '$2b$10$Qe3kV1tqB8nN0yH6xP2uUe4m9Lr7sD1aZc5wT8fG3hJ6kM0nB2vXy', 0, '2026-10-05 08:30:00+09'),
('U002', 'locked@colorado.jp',  '$2b$10$Qe3kV1tqB8nN0yH6xP2uUe4m9Lr7sD1aZc5wT8fG3hJ6kM0nB2vXy', 5, '2026-09-28 17:02:00+09'),
('U003', 'owner@colorado.jp',   '$2b$10$7aR2pW9cE4kL1mN8vB3xZuQ6tY0iO5sD2fG7hJ1kL4zX9cV6bN3mQ', 0, '2026-10-04 21:15:00+09'),
('U004', 'staff01@colorado.jp', '$2b$10$1bC4dE7fG0hI3jK6lM9nOuP2qR5sT8uV1wX4yZ7aB0cD3eF6gH9iJ', 2, '2026-10-01 10:40:00+09'),
('U005', 'audit@colorado.jp',   '$2b$10$9zY6xW3vU0tS7rQ4pO1nMuL8kJ5iH2gF9eD6cB3aZ0yX7wV4uT1sR', 0, NULL);

INSERT INTO suppliers (supplier_id, supplier_name, contact_info, lead_time) VALUES
('SUP-01', 'Ningbo Tackle Works',      'order@ningbo-tackle.example.cn', 21),
('SUP-02', 'หจก. สมุนไพรไทยเจริญ',      'sales@thaiherb.example.co.th',   10),
('SUP-03', 'Qingdao Outdoor Gear',     'po@qingdao-outdoor.example.cn',  28),
('SUP-04', 'Foshan Homeware Ltd.',     'trade@foshan-home.example.cn',   18),
('SUP-05', 'Osaka Frame Studio',       'info@osaka-frame.example.jp',    14);

INSERT INTO products (sku, product_name, variation, sales_channel, supplier_id, reorder_threshold, reorder_qty, selling_price) VALUES
('FSH-MLR-240', 'เหยื่อปลอมมินโนว์ จมช้า 24 กรัม',      'สีเงินลายปลาซิว', 'Rakuten Ichiba', 'SUP-01', 40, 200, 1280),
('YDM-HRB-012', 'ยาดมสมุนไพร สูตรเข้มข้น',            'แพ็ค 3 หลอด',    'Rakuten Ichiba', 'SUP-02', 60, 300, 540),
('OUT-CHR-003', 'เก้าอี้พับแคมป์ปิ้ง โครงอะลูมิเนียม',   'สีเขียวมะกอก',    'Rakuten Ichiba', 'SUP-03', 15, 60,  3450),
('HOM-STG-045', 'กล่องเก็บของพับได้ ฝาใส',             'ขนาด 28 ลิตร',   'Rakuten Ichiba', 'SUP-04', 25, 120, NULL),
('FSH-RDS-180', 'คันเบ็ดสปินนิ่ง 1.8 เมตร',             'แอ็คชันกลาง',    'Rakuten Ichiba', 'SUP-01', 10, 40,  2690),
('OUT-LMP-021', 'ตะเกียงแคมป์ปิ้ง ชาร์จ USB',           'แสงวอร์ม',       'Rakuten Ichiba', 'SUP-03', 20, 80,  1150),
('HOM-KIT-108', 'ชุดกล่องถนอมอาหาร 5 ชิ้น',            'ฝาสีเทา',        'Rakuten Ichiba', NULL,     10, 0,   790);

INSERT INTO sku_rules (sku_rule_id, channel_sku, sales_channel, sku, variation, product_name) VALUES
(1, 'rk-mlr240-sv', 'Rakuten Ichiba', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 'เหยื่อปลอมมินโนว์ จมช้า 24 กรัม'),
(2, 'rk-ydm012-3',  'Rakuten Ichiba', 'YDM-HRB-012', 'แพ็ค 3 หลอด',    'ยาดมสมุนไพร สูตรเข้มข้น'),
(3, 'rk-chr003-ol', 'Rakuten Ichiba', 'OUT-CHR-003', 'สีเขียวมะกอก',    'เก้าอี้พับแคมป์ปิ้ง โครงอะลูมิเนียม'),
(4, 'rk-stg045-28', 'Rakuten Ichiba', 'HOM-STG-045', 'ขนาด 28 ลิตร',   'กล่องเก็บของพับได้ ฝาใส'),
(5, 'rk-rds180-m',  'Rakuten Ichiba', 'FSH-RDS-180', 'แอ็คชันกลาง',    'คันเบ็ดสปินนิ่ง 1.8 เมตร'),
(6, 'rk-lmp021-w',  'Rakuten Ichiba', 'OUT-LMP-021', 'แสงวอร์ม',       'ตะเกียงแคมป์ปิ้ง ชาร์จ USB');
SELECT setval('sku_rules_sku_rule_id_seq', 6);

INSERT INTO stock (sku, variation, in_house_qty, rsl_qty, updated_at) VALUES
('FSH-MLR-240', 'สีเงินลายปลาซิว', 52,  96,   '2026-10-05 07:00:00+09'),
('YDM-HRB-012', 'แพ็ค 3 หลอด',    118, NULL, '2026-10-05 07:00:00+09'),
('OUT-CHR-003', 'สีเขียวมะกอก',    6,   8,    '2026-10-05 07:00:00+09'),
('HOM-STG-045', 'ขนาด 28 ลิตร',   1,   0,    '2026-10-05 07:00:00+09'),
('FSH-RDS-180', 'แอ็คชันกลาง',    0,   1,    '2026-10-05 07:00:00+09'),
('OUT-LMP-021', 'แสงวอร์ม',       30,  12,   '2026-10-05 07:00:00+09'),
('HOM-KIT-108', 'ฝาสีเทา',        2,   3,    '2026-10-05 07:00:00+09');

INSERT INTO product_cost (sku, purchase_price, currency, exchange_rate, intl_freight, duty_fee, marketplace_fee, domestic_shipping, rsl_charge, order_qty) VALUES
('FSH-MLR-240', 9100,  'CNY', 4.92, 8600,  3150, 72,  46,  18,   200),
('FSH-RDS-180', 16400, 'CNY', 4.92, 5400,  2080, 148, 92,  18,   40),
('OUT-CHR-003', 32280, 'CNY', 4.92, 11200, 4360, 190, 135, 24,   60),
('HOM-STG-045', 8400,  'CNY', 4.92, 6800,  2100, 64,  58,  18,   120),
('HOM-KIT-108', 3000,  'CNY', 4.92, 3000,  900,  60,  45,  18,   20),
('YDM-HRB-012', 12000, 'THB', 1,    9000,  1800, 32,  40,  NULL, 300),
('OUT-LMP-021', 6400,  'CNY', NULL, 4800,  1500, 52,  46,  18,   80);

INSERT INTO cost_calculation_log (cost_id, sku, unit_cost, calculated_at, calculated_by) VALUES
(1, 'FSH-MLR-240', 433.11, '2025-08-14 10:05:00+09', 'U001'),
(2, 'FSH-RDS-180', 2522.70, '2025-09-02 15:30:00+09', 'U001'),
(3, 'FSH-MLR-240', 418.61, '2026-09-30 11:20:00+09', 'U001'),
(4, 'OUT-CHR-003', 3255.29, '2026-10-01 09:45:00+09', 'U003'),
(5, 'FSH-RDS-180', 2462.20, '2026-10-03 16:10:00+09', 'U001'),
(6, 'HOM-STG-045', 558.57, '2026-10-04 13:00:00+09', 'U001');
SELECT setval('cost_calculation_log_cost_id_seq', 6);

INSERT INTO purchase_orders (po_id, sku, supplier_id, order_qty, order_date, eta, status) VALUES
('PO-0007', 'YDM-HRB-012', 'SUP-02', 300, '2025-06-10 09:00:00+09', '2025-06-20 09:00:00+09', 'ได้รับสินค้าแล้ว'),
('PO-0008', 'FSH-MLR-240', 'SUP-01', 200, '2025-07-01 09:00:00+09', '2025-07-22 09:00:00+09', 'ได้รับสินค้าแล้ว'),
('PO-0009', 'OUT-LMP-021', 'SUP-03', 80,  '2025-08-18 09:00:00+09', '2025-09-15 09:00:00+09', 'ยกเลิกแล้ว'),
('PO-0010', 'HOM-STG-045', 'SUP-04', 120, '2026-09-10 09:00:00+09', '2026-09-28 09:00:00+09', 'ได้รับสินค้าแล้ว'),
('PO-0011', 'FSH-RDS-180', 'SUP-01', 40,  '2026-10-02 09:00:00+09', '2026-10-23 09:00:00+09', 'รอส่งคำสั่งซื้อ'),
('PO-0091', 'OUT-CHR-003', 'SUP-03', 60,  '2026-09-24 10:00:00+09', '2026-10-22 10:00:00+09', 'สั่งซื้อแล้ว');

INSERT INTO shipping_rules (rule_id, shipping_method, sales_channel, label_template) VALUES
(1, 'RSL ปกติ',       'Rakuten Ichiba', 'RSL-STD-A6'),
(2, 'RSL ขนาดใหญ่',   'Rakuten Ichiba', 'RSL-LRG-A5'),
(3, 'ส่งจากร้าน',      'Rakuten Ichiba', 'SHOP-STD-A6'),
(4, 'RSL ส่งด่วน',     'Rakuten Ichiba', 'RSL-EXP-A6'),
(5, 'RSL เก็บปลายทาง', 'Rakuten Ichiba', 'RSL-COD-A6');
SELECT setval('shipping_rules_rule_id_seq', 5);

INSERT INTO rsl_shipments (rsl_order_id, rsl_sku, rsl_variation, rsl_stock_qty) VALUES
('RSL-9f21a7', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 96),
('RSL-9f21b4', 'YDM-HRB-012', 'แพ็ค 3 หลอด',    0),
('RSL-9f21c8', 'OUT-CHR-003', 'สีเขียวมะกอก',    5),
('RSL-9f21c9', 'OUT-CHR-003', 'สีเขียวมะกอก',    3),
('RSL-9f21d3', 'OUT-LMP-021', 'แสงวอร์ม',       12),
('RSL-9f21e5', 'FSH-RDS-180', 'แอ็คชันกลาง',    1);

INSERT INTO orders (order_id, marketplace_order_id, order_date, channel_sku, sku, variation, qty, shipping_address, shipping_method, order_status,
                    verified_at, verified_by, sku_rule_id, decision, decided_at, decided_by, po_id,
                    rsl_matched, rsl_reference_id, matched_at, fulfill_source, tracking_number, carrier_name, dispatched_at,
                    tracking_notified, tracking_notified_at, stock_deducted, mp_stock_synced, deducted_at, cancel_reason, cancelled_at, cancelled_by) VALUES
('ORD-24190', '377841-20261005-0000190', '2026-10-05 09:12:00+09', 'rk-mlr240-sv', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 2, '150-0001 東京都渋谷区神宮前 1-2-3', 'RSL ปกติ', 'รอตรวจสอบคำสั่งซื้อ',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, 'rsl', NULL, NULL, NULL, false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24185', '377841-20261004-0000185', '2026-10-04 19:40:00+09', 'rk-mlr240-sv', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 0, '530-0001 大阪府大阪市北区梅田 2-4-9', 'RSL ปกติ', 'รอตรวจสอบคำสั่งซื้อ',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, 'rsl', NULL, NULL, NULL, false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24184', '377841-20261004-0000184', '2026-10-04 18:55:00+09', 'rk-rds180-m', 'FSH-RDS-180', 'แอ็คชันกลาง', 2, '460-0008 愛知県名古屋市中区栄 3-5-1', 'RSL ปกติ', 'รอ Admin ตัดสินใจสั่งซื้อ',
 '2026-10-04 19:10:00+09', 'U001', 5, NULL, NULL, NULL, NULL, false, NULL, NULL, 'rsl', NULL, NULL, NULL, false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24183', '377841-20261004-0000183', '2026-10-04 16:20:00+09', 'rk-mlr240-sv', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 4, '812-0011 福岡県福岡市博多区博多駅前 2-1-1', 'RSL ปกติ', 'ยังไม่ได้จับคู่',
 '2026-10-04 16:40:00+09', 'U001', 1, NULL, NULL, NULL, NULL, false, NULL, NULL, 'rsl', NULL, NULL, NULL, false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24181', '377841-20261004-0000181', '2026-10-04 11:05:00+09', 'rk-lmp021-w', 'OUT-LMP-021', 'แสงวอร์ม', 1, '060-0001 北海道札幌市中央区北1条西 4-2', 'RSL ปกติ', 'รอพิมพ์ใบปะสินค้า',
 '2026-10-04 11:20:00+09', 'U001', 6, NULL, NULL, NULL, NULL, true, 'RSL-9f2231', '2026-10-04 11:25:00+09', 'rsl', NULL, NULL, NULL, false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24178', '377841-20261003-0000178', '2026-10-03 15:42:00+09', 'rk-mlr240-sv', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 2, '980-0021 宮城県仙台市青葉区中央 1-3-1', 'RSL ปกติ', 'พิมพ์ใบปะสินค้าแล้ว',
 '2026-10-03 16:00:00+09', 'U001', 1, NULL, NULL, NULL, NULL, true, 'RSL-9f2219', '2026-10-03 16:05:00+09', 'rsl', NULL, NULL, NULL, false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24176', '377841-20261003-0000176', '2026-10-03 13:20:00+09', 'rk-chr003-ol', 'OUT-CHR-003', 'สีเขียวมะกอก', 20, '730-0011 広島県広島市中区基町 6-78', 'RSL ขนาดใหญ่', 'สั่งซื้อแล้ว',
 '2026-10-03 13:40:00+09', 'U001', 3, 'คุ้มค่า', '2026-10-03 14:00:00+09', 'U001', 'PO-0091', false, NULL, NULL, 'rsl', NULL, NULL, NULL, false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24174', '377841-20261003-0000174', '2026-10-03 09:15:00+09', 'rk-rds180-m', 'FSH-RDS-180', 'แอ็คชันกลาง', 1, '650-0001 兵庫県神戸市中央区加納町 6-5-1', 'RSL ปกติ', 'อยู่ระหว่างจัดส่ง',
 '2026-10-03 09:30:00+09', 'U001', 5, NULL, NULL, NULL, NULL, true, 'RSL-9f2207', '2026-10-03 09:35:00+09', 'rsl', '4418-2291-4174', 'Yamato Transport', '2026-10-03 17:00:00+09', false, NULL, false, false, NULL, NULL, NULL, NULL),
('ORD-24160', '377841-20250815-0000160', '2025-08-15 10:00:00+09', 'rk-mlr240-sv', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 3, '220-0011 神奈川県横浜市西区高島 2-16-1', 'RSL ปกติ', 'จัดส่งสำเร็จ',
 '2025-08-15 10:20:00+09', 'U001', 1, NULL, NULL, NULL, NULL, true, 'RSL-8a1102', '2025-08-15 10:25:00+09', 'rsl', '4418-2291-4160', 'Yamato Transport', '2025-08-15 17:00:00+09', true, '2025-08-15 17:05:00+09', true, true, '2025-08-15 17:10:00+09', NULL, NULL, NULL),
('ORD-24161', '377841-20250902-0000161', '2025-09-02 14:30:00+09', 'rk-ydm012-3', 'YDM-HRB-012', 'แพ็ค 3 หลอด', 2, '330-0063 埼玉県さいたま市浦和区高砂 3-15-1', 'ส่งจากร้าน', 'ยกเลิกแล้ว',
 '2025-09-02 14:45:00+09', 'U001', 2, NULL, NULL, NULL, NULL, false, NULL, NULL, 'in_house', NULL, NULL, NULL, false, NULL, false, false, NULL, 'ลูกค้าขอยกเลิก', '2025-09-02 15:00:00+09', 'U001'),
('ORD-24170', '377841-20261001-0000170', '2026-10-01 12:00:00+09', 'rk-lmp021-w', 'OUT-LMP-021', 'แสงวอร์ม', 1, '260-0013 千葉県千葉市中央区中央 4-5-1', 'RSL ปกติ', 'จัดส่งสำเร็จ',
 '2026-10-01 12:20:00+09', 'U001', 6, NULL, NULL, NULL, NULL, true, 'RSL-9f2101', '2026-10-01 12:25:00+09', 'rsl', '4418-2291-4170', 'Yamato Transport', '2026-10-01 17:00:00+09', true, '2026-10-01 17:05:00+09', true, true, '2026-10-01 17:10:00+09', NULL, NULL, NULL),
('ORD-24172', '377841-20261002-0000172', '2026-10-02 10:30:00+09', 'rk-mlr240-sv', 'FSH-MLR-240', 'สีเงินลายปลาซิว', 1, '600-8216 京都府京都市下京区烏丸通 7-1', 'RSL ปกติ', 'แจ้งเลขติดตามแล้ว',
 '2026-10-02 10:45:00+09', 'U001', 1, NULL, NULL, NULL, NULL, true, 'RSL-9f2150', '2026-10-02 10:50:00+09', 'rsl', '4418-2291-4172', 'Yamato Transport', '2026-10-02 17:00:00+09', true, '2026-10-02 17:05:00+09', false, false, NULL, NULL, NULL, NULL);

INSERT INTO label (label_id, order_id, label_template, rsl_reference_id, parcel_seq, parcel_total, label_status, created_at, printed_at) VALUES
(1, 'ORD-24160', 'RSL-STD-A6', 'RSL-8a1102', 1, 1, 'พิมพ์แล้ว', '2025-08-15 10:30:00+09', '2025-08-15 10:40:00+09'),
(2, 'ORD-24170', 'RSL-STD-A6', 'RSL-9f2101', 1, 1, 'พิมพ์แล้ว', '2026-10-01 12:30:00+09', '2026-10-01 12:40:00+09'),
(3, 'ORD-24172', 'RSL-STD-A6', 'RSL-9f2150', 1, 1, 'พิมพ์แล้ว', '2026-10-02 10:55:00+09', '2026-10-02 11:00:00+09'),
(4, 'ORD-24174', 'RSL-STD-A6', 'RSL-9f2207', 1, 1, 'พิมพ์แล้ว', '2026-10-03 09:40:00+09', '2026-10-03 09:50:00+09'),
(5, 'ORD-24178', 'RSL-STD-A6', 'RSL-9f2219', 1, 1, 'พิมพ์แล้ว', '2026-10-03 16:10:00+09', '2026-10-03 16:20:00+09'),
(6, 'ORD-24181', 'RSL-STD-A6', 'RSL-9f2231', 1, 1, 'รอพิมพ์',  '2026-10-04 11:30:00+09', NULL);
SELECT setval('label_label_id_seq', 6);

INSERT INTO delivery_partners (tracking_number, order_id, carrier_name, pickup_date) VALUES
('4418-2291-4160', 'ORD-24160', 'Yamato Transport', '2025-08-15'),
('4418-2291-4170', 'ORD-24170', 'Yamato Transport', '2026-10-01'),
('4418-2291-4172', 'ORD-24172', 'Yamato Transport', '2026-10-02'),
('4418-2291-4174', 'ORD-24174', 'Yamato Transport', '2026-10-03'),
('4418-2291-4178', 'ORD-24178', 'Yamato Transport', '2026-10-05');

INSERT INTO carrier_tracking (tracking_number, delivery_status, last_location, updated_at) VALUES
('4418-2291-4160', 'delivered',  'Yokohama Nishi Center',  '2025-08-16 14:00:00+09'),
('4418-2291-4170', 'delivered',  'Chiba Chuo Center',      '2026-10-02 11:30:00+09'),
('4418-2291-4172', 'in_transit', 'Kyoto Minami Hub',       '2026-10-03 06:10:00+09'),
('4418-2291-4174', 'in_transit', 'Kobe Port Hub',          '2026-10-04 08:20:00+09'),
('4418-2291-4178', 'in_transit', 'Sendai Aoba Center',     '2026-10-05 18:00:00+09');

INSERT INTO deletion_log (log_id, data_type, record_id, deleted_at, deleted_by) VALUES
(1, 'order',   'ORD-24012', '2026-01-10 09:00:00+09', 'U001'),
(2, 'order',   'ORD-24013', '2026-01-10 09:00:00+09', 'U001'),
(3, 'cost',    '102',         '2026-01-10 09:00:00+09', 'U001'),
(4, 'label',   '57',          '2026-01-10 09:00:00+09', 'U003'),
(5, 'reorder', 'PO-0003',   '2026-01-10 09:00:00+09', 'U003');
SELECT setval('deletion_log_log_id_seq', 5);
