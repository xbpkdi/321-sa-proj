-- ฐานข้อมูลระบบหลังบ้าน Colorado (PostgreSQL) 17 ตาราง
-- รวมผลของ 01418321-final-project/db/migrations/001-008 เป็นโครงสร้างสุดท้าย
-- คอลัมน์ที่ migration ภายหลังเพิ่มด้วย ALTER TABLE อยู่ท้ายตาราง เรียงเหมือนฐานข้อมูลจริง
-- ไม่รวม schema_migrations ซึ่งเป็นตารางที่ตัวรัน migration ใช้จดว่ารันไฟล์ใดแล้ว

CREATE TABLE admins (
  admin_id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  user_password TEXT NOT NULL,
  fail_attempts INTEGER NOT NULL DEFAULT 0 CHECK (fail_attempts >= 0),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- 007
  locked_until TIMESTAMPTZ
);

CREATE TABLE suppliers (
  supplier_id TEXT PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  lead_time_days INTEGER NOT NULL CHECK (lead_time_days >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skus (
  sku_id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  variation TEXT NOT NULL,
  sales_channel TEXT NOT NULL CHECK (sales_channel = 'Rakuten Ichiba'),
  channel_sku TEXT NOT NULL UNIQUE,
  selling_price NUMERIC(14, 2),
  reorder_threshold INTEGER NOT NULL CHECK (reorder_threshold >= 0),
  reorder_qty INTEGER NOT NULL CHECK (reorder_qty >= 0),
  sku_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  supplier_id TEXT REFERENCES suppliers(supplier_id)
);

CREATE TABLE stock (
  stock_id TEXT PRIMARY KEY,
  in_house_qty INTEGER NOT NULL CHECK (in_house_qty >= 0),
  rsl_qty INTEGER CHECK (rsl_qty IS NULL OR rsl_qty >= 0),
  updated_at TIMESTAMPTZ NOT NULL,
  sku_id TEXT NOT NULL UNIQUE REFERENCES skus(sku_id)
);

CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  marketplace_order_id TEXT NOT NULL UNIQUE,
  sales_channel TEXT NOT NULL CHECK (sales_channel = 'Rakuten Ichiba'),
  order_date TIMESTAMPTZ NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_method TEXT NOT NULL,
  order_status TEXT NOT NULL CHECK (order_status IN (
    'รอตรวจสอบคำสั่งซื้อ',
    'รอจับคู่กฎ SKU',
    'รอตรวจสอบสต๊อก',
    'รอ Admin ตัดสินใจสั่งซื้อ',
    'รอสั่งซื้อจาก Supplier',
    'สั่งซื้อแล้ว',
    'ยังไม่ได้จับคู่',
    'รอจัดรูปแบบใบปะสินค้า',
    'รอพิมพ์ใบปะสินค้า',
    'พิมพ์ใบปะสินค้าแล้ว',
    'รอส่งคำสั่งซื้อ',
    'รอส่งมอบ',
    'อยู่ระหว่างจัดส่ง',
    'รอแจ้งเลขติดตาม',
    'แจ้งเลขติดตามแล้ว',
    'จัดส่งสำเร็จ',
    'จัดส่งไม่สำเร็จ',
    'ตีกลับ/คืนสินค้า',
    'รอยกเลิก Order',
    'ยกเลิกแล้ว',
    'รอดำเนินการด้วยตนเอง',
    'รอดำเนินการพิเศษ'
  )),
  rsl_no TEXT,
  rsl_matched_at TIMESTAMPTZ,
  tracking_number TEXT,
  carrier_name TEXT,
  dispatched_at TIMESTAMPTZ,
  tracking_notified BOOLEAN NOT NULL DEFAULT FALSE,
  tracking_notified_at TIMESTAMPTZ,
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- 003
  manual_reason TEXT CHECK (manual_reason IN (
    'incomplete', 'sku-unregistered', 'sku-rule', 'rsl', 'template',
    'address', 'price', 'supplier', 'stock-deduct'
  )),
  customer_cancel_requested BOOLEAN NOT NULL DEFAULT FALSE,
  edit_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- 004
  reorder_decision TEXT CHECK (reorder_decision IS NULL OR reorder_decision IN ('คุ้มค่า', 'ไม่คุ้มค่า')),
  decided_qty INTEGER CHECK (decided_qty IS NULL OR decided_qty > 0),
  -- 005
  delivery_status TEXT CHECK (delivery_status IS NULL OR delivery_status IN ('in_transit', 'delivered', 'failed', 'returned'))
);

CREATE TABLE order_items (
  order_item_id TEXT PRIMARY KEY,
  channel_sku TEXT NOT NULL,
  variation TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty >= 0),
  fulfill_source TEXT NOT NULL CHECK (fulfill_source IN ('in_house', 'rsl')),
  stock_deducted BOOLEAN NOT NULL DEFAULT FALSE,
  deducted_at TIMESTAMPTZ,
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  sku_id TEXT REFERENCES skus(sku_id),
  UNIQUE (order_id, channel_sku)
);

CREATE TABLE costs (
  cost_id TEXT PRIMARY KEY,
  purchase_price NUMERIC(14, 4),
  currency TEXT NOT NULL,
  exchange_rate NUMERIC(14, 6),
  intl_freight NUMERIC(14, 4),
  duty_fee NUMERIC(14, 4),
  marketplace_fee NUMERIC(14, 4),
  domestic_shipping NUMERIC(14, 4),
  rsl_charge NUMERIC(14, 4),
  order_qty INTEGER CHECK (order_qty IS NULL OR order_qty > 0),
  unit_cost NUMERIC(14, 4),
  calculated_at TIMESTAMPTZ,
  sku_id TEXT NOT NULL REFERENCES skus(sku_id),
  order_id TEXT REFERENCES orders(order_id),
  -- 002
  exchange_rate_updated_at TIMESTAMPTZ
);

CREATE TABLE reorders (
  reorder_id TEXT PRIMARY KEY,
  order_qty INTEGER NOT NULL CHECK (order_qty > 0),
  decision TEXT,
  decided_at TIMESTAMPTZ,
  reorder_status TEXT NOT NULL,
  ordered_at TIMESTAMPTZ,
  expected_date DATE,
  supplier_tracking_no TEXT,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sku_id TEXT NOT NULL REFERENCES skus(sku_id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(supplier_id),
  -- 004
  supplier_request_id TEXT UNIQUE,
  supplier_reference TEXT,
  last_error_code TEXT,
  -- 006
  received_qty INTEGER CHECK (received_qty IS NULL OR received_qty > 0)
);

-- 006: Order ผูกกับคำสั่งซื้อเติมสต๊อก (reorders 1 : N orders) ประกาศหลัง reorders เพราะ FK อ้างไปข้างหน้า
ALTER TABLE orders ADD COLUMN reorder_id TEXT REFERENCES reorders(reorder_id) ON DELETE SET NULL;
CREATE INDEX orders_reorder_idx ON orders(reorder_id);

CREATE TABLE labels (
  label_id TEXT PRIMARY KEY,
  label_template TEXT NOT NULL,
  rsl_no TEXT,
  parcel_seq INTEGER NOT NULL CHECK (parcel_seq > 0),
  parcel_total INTEGER NOT NULL CHECK (parcel_total > 0),
  label_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  printed_at TIMESTAMPTZ,
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  UNIQUE (order_id, parcel_seq)
);

CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(admin_id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  CHECK (expires_at > created_at)
);

CREATE INDEX sessions_admin_id_idx ON sessions(admin_id);
CREATE INDEX sessions_active_token_idx ON sessions(token_hash, expires_at) WHERE revoked_at IS NULL;

CREATE TABLE auto_error_logs (
  auto_error_log_id TEXT PRIMARY KEY,
  use_case_id TEXT NOT NULL,
  context_key TEXT NOT NULL,
  error_code TEXT NOT NULL,
  safe_message TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deletion_history (
  deletion_history_id TEXT PRIMARY KEY,
  order_reference TEXT NOT NULL,
  order_snapshot JSONB NOT NULL,
  admin_id TEXT NOT NULL REFERENCES admins(admin_id),
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cost_history (
  cost_history_id TEXT PRIMARY KEY,
  sku_id TEXT NOT NULL REFERENCES skus(sku_id),
  cost_id TEXT REFERENCES costs(cost_id),
  previous_value JSONB,
  new_value JSONB NOT NULL,
  admin_id TEXT NOT NULL REFERENCES admins(admin_id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tracking_notification_logs (
  tracking_notification_log_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  outcome TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  admin_id TEXT REFERENCES admins(admin_id),
  -- 005
  attempt_id TEXT NOT NULL,
  error_code TEXT
);

CREATE UNIQUE INDEX tracking_notification_attempt_idx ON tracking_notification_logs(attempt_id);

CREATE TABLE rakuten_stock_sync_states (
  stock_id TEXT PRIMARY KEY REFERENCES stock(stock_id) ON DELETE CASCADE,
  sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'synced')),
  last_synced_qty INTEGER CHECK (last_synced_qty IS NULL OR last_synced_qty >= 0),
  last_attempt_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  last_error_code TEXT
);

CREATE TABLE stock_adjustment_history (
  stock_adjustment_history_id TEXT PRIMARY KEY,
  stock_id TEXT NOT NULL REFERENCES stock(stock_id) ON DELETE CASCADE,
  previous_in_house_qty INTEGER NOT NULL CHECK (previous_in_house_qty >= 0),
  new_in_house_qty INTEGER NOT NULL CHECK (new_in_house_qty >= 0),
  previous_rsl_qty INTEGER CHECK (previous_rsl_qty IS NULL OR previous_rsl_qty >= 0),
  new_rsl_qty INTEGER CHECK (new_rsl_qty IS NULL OR new_rsl_qty >= 0),
  reason TEXT NOT NULL,
  admin_id TEXT NOT NULL REFERENCES admins(admin_id),
  adjusted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX stock_adjustment_history_stock_idx ON stock_adjustment_history(stock_id, adjusted_at DESC);

CREATE TABLE label_print_history (
  label_print_history_id TEXT PRIMARY KEY,
  print_attempt_id TEXT NOT NULL,
  label_id TEXT NOT NULL REFERENCES labels(label_id) ON DELETE CASCADE,
  admin_id TEXT NOT NULL REFERENCES admins(admin_id),
  is_reprint BOOLEAN NOT NULL DEFAULT FALSE,
  outcome TEXT NOT NULL CHECK (outcome IN ('printed', 'failed')),
  error_code TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (print_attempt_id, label_id)
);

CREATE INDEX label_print_history_label_idx ON label_print_history(label_id, attempted_at DESC);

-- 008 เลขคำสั่งซื้อแบบรันนิ่ง PO-0092, PO-0093, ... (sequence ไม่ใช่ตาราง)
CREATE SEQUENCE reorder_no_seq MINVALUE 1;
