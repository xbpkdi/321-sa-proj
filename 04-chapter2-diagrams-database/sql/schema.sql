-- ฐานข้อมูลระบบหลังบ้าน Colorado (PostgreSQL)
-- ชื่อตารางและคอลัมน์ตรงกับ query ใน 01418321-final-project/report-doc/content/usecases.json

CREATE SEQUENCE orders_seq START 24191;
CREATE SEQUENCE purchase_orders_seq START 13;

CREATE TABLE users (
  user_id        VARCHAR(10)  PRIMARY KEY,
  user_email     VARCHAR(100) NOT NULL UNIQUE,
  user_password  VARCHAR(100) NOT NULL,
  fail_attempts  SMALLINT     NOT NULL DEFAULT 0 CHECK (fail_attempts BETWEEN 0 AND 10),
  last_login     TIMESTAMPTZ
);

CREATE TABLE suppliers (
  supplier_id    VARCHAR(10)  PRIMARY KEY,
  supplier_name  VARCHAR(100) NOT NULL,
  contact_info   VARCHAR(150) NOT NULL,
  lead_time      SMALLINT     NOT NULL CHECK (lead_time BETWEEN 1 AND 180)
);

CREATE TABLE products (
  sku                VARCHAR(20)   PRIMARY KEY,
  product_name       VARCHAR(150)  NOT NULL,
  variation          VARCHAR(50)   NOT NULL,
  sales_channel      VARCHAR(30)   NOT NULL DEFAULT 'Rakuten Ichiba',
  supplier_id        VARCHAR(10)   REFERENCES suppliers (supplier_id),
  reorder_threshold  INTEGER       NOT NULL CHECK (reorder_threshold >= 0),
  reorder_qty        INTEGER       NOT NULL CHECK (reorder_qty >= 0),
  selling_price      NUMERIC(10,2) CHECK (selling_price > 0),
  active             BOOLEAN       NOT NULL DEFAULT true
);

CREATE TABLE sku_rules (
  sku_rule_id    SERIAL       PRIMARY KEY,
  channel_sku    VARCHAR(40)  NOT NULL,
  sales_channel  VARCHAR(30)  NOT NULL DEFAULT 'Rakuten Ichiba',
  sku            VARCHAR(20)  NOT NULL REFERENCES products (sku),
  variation      VARCHAR(50)  NOT NULL,
  product_name   VARCHAR(150) NOT NULL,
  UNIQUE (channel_sku, sales_channel)
);

CREATE TABLE stock (
  sku           VARCHAR(20) PRIMARY KEY REFERENCES products (sku),
  variation     VARCHAR(50) NOT NULL,
  in_house_qty  INTEGER     NOT NULL DEFAULT 0 CHECK (in_house_qty >= 0),
  rsl_qty       INTEGER     CHECK (rsl_qty >= 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_cost (
  sku                VARCHAR(20)   PRIMARY KEY REFERENCES products (sku),
  purchase_price     NUMERIC(12,2) CHECK (purchase_price >= 0),
  currency           CHAR(3)       NOT NULL CHECK (currency IN ('CNY','THB','JPY','USD')),
  exchange_rate      NUMERIC(8,4)  CHECK (exchange_rate > 0),
  intl_freight       NUMERIC(10,2) CHECK (intl_freight >= 0),
  duty_fee           NUMERIC(10,2) CHECK (duty_fee >= 0),
  marketplace_fee    NUMERIC(10,2) CHECK (marketplace_fee >= 0),
  domestic_shipping  NUMERIC(10,2) CHECK (domestic_shipping >= 0),
  rsl_charge         NUMERIC(10,2) CHECK (rsl_charge >= 0),
  order_qty          INTEGER       CHECK (order_qty > 0)
);

CREATE TABLE cost_calculation_log (
  cost_id        SERIAL        PRIMARY KEY,
  sku            VARCHAR(20)   NOT NULL REFERENCES products (sku),
  unit_cost      NUMERIC(10,2) NOT NULL CHECK (unit_cost >= 0),
  calculated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  calculated_by  VARCHAR(10)   NOT NULL REFERENCES users (user_id)
);

CREATE TABLE purchase_orders (
  po_id        VARCHAR(12)  PRIMARY KEY DEFAULT 'PO-' || LPAD(nextval('purchase_orders_seq')::text, 4, '0'),
  sku          VARCHAR(20)  NOT NULL REFERENCES products (sku),
  supplier_id  VARCHAR(10)  NOT NULL REFERENCES suppliers (supplier_id),
  order_qty    INTEGER      NOT NULL CHECK (order_qty > 0),
  order_date   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  eta          TIMESTAMPTZ  NOT NULL,
  status       VARCHAR(20)  NOT NULL CHECK (status IN ('รอส่งคำสั่งซื้อ','สั่งซื้อแล้ว','ได้รับสินค้าแล้ว','ยกเลิกแล้ว'))
);

CREATE TABLE shipping_rules (
  rule_id          SERIAL      PRIMARY KEY,
  shipping_method  VARCHAR(30) NOT NULL,
  sales_channel    VARCHAR(30) NOT NULL DEFAULT 'Rakuten Ichiba',
  label_template   VARCHAR(30) NOT NULL,
  UNIQUE (shipping_method, sales_channel)
);

CREATE TABLE orders (
  order_id              VARCHAR(12)  PRIMARY KEY DEFAULT 'ORD-' || nextval('orders_seq'),
  marketplace_order_id  VARCHAR(30)  NOT NULL,
  sales_channel         VARCHAR(30)  NOT NULL DEFAULT 'Rakuten Ichiba',
  order_date            TIMESTAMPTZ  NOT NULL,
  channel_sku           VARCHAR(40)  NOT NULL,
  sku                   VARCHAR(20)  REFERENCES products (sku),
  variation             VARCHAR(50),
  qty                   INTEGER      NOT NULL CHECK (qty >= 0),
  shipping_address      VARCHAR(255),
  shipping_method       VARCHAR(30)  NOT NULL,
  order_status          VARCHAR(30)  NOT NULL CHECK (order_status IN (
    'รอตรวจสอบคำสั่งซื้อ','รอจับคู่กฎ SKU','รอตรวจสอบสต๊อก','รอ Admin ตัดสินใจสั่งซื้อ',
    'รอสั่งซื้อจาก Supplier','สั่งซื้อแล้ว','ยังไม่ได้จับคู่','รอจัดรูปแบบใบปะสินค้า',
    'รอพิมพ์ใบปะสินค้า','พิมพ์ใบปะสินค้าแล้ว','รอส่งคำสั่งซื้อ','รอส่งมอบ','อยู่ระหว่างจัดส่ง',
    'รอแจ้งเลขติดตาม','แจ้งเลขติดตามแล้ว','จัดส่งสำเร็จ','จัดส่งไม่สำเร็จ','ตีกลับ/คืนสินค้า',
    'รอยกเลิก Order','ยกเลิกแล้ว','รอดำเนินการด้วยตนเอง','รอดำเนินการพิเศษ')),
  verified_at           TIMESTAMPTZ,
  verified_by           VARCHAR(10)  REFERENCES users (user_id),
  sku_rule_id           INTEGER      REFERENCES sku_rules (sku_rule_id),
  sku_matched_at        TIMESTAMPTZ,
  decision              VARCHAR(10)  CHECK (decision IN ('คุ้มค่า','ไม่คุ้มค่า')),
  decided_at            TIMESTAMPTZ,
  decided_by            VARCHAR(10)  REFERENCES users (user_id),
  po_id                 VARCHAR(12)  REFERENCES purchase_orders (po_id),
  rsl_matched           BOOLEAN      NOT NULL DEFAULT false,
  rsl_reference_id      VARCHAR(20),
  matched_at            TIMESTAMPTZ,
  fulfill_source        VARCHAR(10)  NOT NULL DEFAULT 'rsl' CHECK (fulfill_source IN ('in_house','rsl')),
  tracking_number       VARCHAR(20),
  carrier_name          VARCHAR(50),
  dispatched_at         TIMESTAMPTZ,
  tracking_notified     BOOLEAN      NOT NULL DEFAULT false,
  tracking_notified_at  TIMESTAMPTZ,
  stock_deducted        BOOLEAN      NOT NULL DEFAULT false,
  mp_stock_synced       BOOLEAN      NOT NULL DEFAULT false,
  deducted_at           TIMESTAMPTZ,
  cancel_reason         VARCHAR(255),
  cancelled_at          TIMESTAMPTZ,
  cancelled_by          VARCHAR(10)  REFERENCES users (user_id),
  UNIQUE (marketplace_order_id, sales_channel),
  FOREIGN KEY (shipping_method, sales_channel) REFERENCES shipping_rules (shipping_method, sales_channel)
);


CREATE TABLE label (
  label_id          SERIAL      PRIMARY KEY,
  order_id          VARCHAR(12) NOT NULL REFERENCES orders (order_id),
  label_template    VARCHAR(30) NOT NULL,
  rsl_reference_id  VARCHAR(20) NOT NULL,
  parcel_seq        SMALLINT    NOT NULL CHECK (parcel_seq >= 1),
  parcel_total      SMALLINT    NOT NULL CHECK (parcel_total >= parcel_seq),
  label_status      VARCHAR(10) NOT NULL CHECK (label_status IN ('รอพิมพ์','พิมพ์แล้ว')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  printed_at        TIMESTAMPTZ
);

CREATE TABLE rsl_shipments (
  rsl_order_id   VARCHAR(20) PRIMARY KEY,
  rsl_sku        VARCHAR(20) NOT NULL REFERENCES products (sku),
  rsl_variation  VARCHAR(50) NOT NULL,
  rsl_stock_qty  INTEGER     NOT NULL CHECK (rsl_stock_qty >= 0)
);

CREATE TABLE delivery_partners (
  tracking_number  VARCHAR(20) PRIMARY KEY,
  order_id         VARCHAR(12) NOT NULL UNIQUE REFERENCES orders (order_id) ON DELETE CASCADE,
  carrier_name     VARCHAR(50) NOT NULL,
  pickup_date      DATE        NOT NULL
);

CREATE TABLE carrier_tracking (
  tracking_number  VARCHAR(20)  PRIMARY KEY REFERENCES delivery_partners (tracking_number) ON DELETE CASCADE,
  delivery_status  VARCHAR(12)  NOT NULL CHECK (delivery_status IN ('in_transit','delivered','failed','returned')),
  last_location    VARCHAR(100) NOT NULL,
  updated_at       TIMESTAMPTZ  NOT NULL
);

CREATE TABLE deletion_log (
  log_id      SERIAL      PRIMARY KEY,
  data_type   VARCHAR(10) NOT NULL CHECK (data_type IN ('order','cost','label','reorder')),
  record_id   VARCHAR(20) NOT NULL,
  deleted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by  VARCHAR(10) NOT NULL REFERENCES users (user_id)
);
