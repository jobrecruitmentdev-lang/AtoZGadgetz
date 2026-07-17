const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const userRelations = `
  orders             Order[]
  status_changes     OrderStatusHistory[]
  returns            ReturnOrder[]
  sessions           UserSession[]
  media_files        MediaFile[]
  notifications      Notification[]
  behaviours         UserBehaviour[]
  audit_logs         AuditLog[]
  analytics_events   AnalyticsEvent[]
`;
schema = schema.replace(/(model User \{[\s\S]*?)(?=\})/, `$1${userRelations}`);

const productRelations = `
  order_items        OrderItem[]
  inventory          Inventory[]
  stock_movements    StockMovement[]
  featured           FeaturedProduct[]
  offers             OfferProduct[]
  behaviours         UserBehaviour[]
`;
schema = schema.replace(/(model Product \{[\s\S]*?)(?=\})/, `$1${productRelations}`);

const categoryRelations = `
  offers             OfferCategory[]
`;
schema = schema.replace(/(model Category \{[\s\S]*?)(?=\})/, `$1${categoryRelations}`);

const addressRelations = `
  orders             Order[]
`;
schema = schema.replace(/(model UserAddress \{[\s\S]*?)(?=\})/, `$1${addressRelations}`);

const couponRelations = `
  orders             Order[]
`;
schema = schema.replace(/(model Coupon \{[\s\S]*?)(?=\})/, `$1${couponRelations}`);

const variantRelations = `
  order_items        OrderItem[]
  inventory          Inventory[]
`;
schema = schema.replace(/(model ProductVariant \{[\s\S]*?)(?=\})/, `$1${variantRelations}`);

const newModels = `
model Order {
  id              Int      @id @default(autoincrement())
  order_number    String   @unique @db.VarChar(100)
  user_id         Int
  address_id      Int
  subtotal        Decimal  @db.Decimal(10, 2)
  discount_amount Decimal  @default(0.00) @db.Decimal(10, 2)
  tax_amount      Decimal  @default(0.00) @db.Decimal(10, 2)
  shipping_charge Decimal  @default(0.00) @db.Decimal(10, 2)
  total_amount    Decimal  @db.Decimal(10, 2)
  coupon_id       Int?
  offer_discount  Decimal  @default(0.00) @db.Decimal(10, 2)
  payment_status  String?  @default("pending") @db.VarChar(50)
  order_status    String?  @default("pending") @db.VarChar(50)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  user           User                 @relation(fields: [user_id], references: [id], onDelete: Cascade)
  address        UserAddress          @relation(fields: [address_id], references: [id], onDelete: Restrict)
  coupon         Coupon?              @relation(fields: [coupon_id], references: [id], onDelete: SetNull)
  items          OrderItem[]
  status_history OrderStatusHistory[]
  payment        Payment?
  shipment       Shipment?
  returns        ReturnOrder[]

  @@map("orders")
}

model OrderStatusHistory {
  id         Int      @id @default(autoincrement())
  order_id   Int
  old_status String?  @db.VarChar(50)
  new_status String   @db.VarChar(50)
  changed_by Int?
  created_at DateTime @default(now())

  order Order @relation(fields: [order_id], references: [id], onDelete: Cascade)
  actor User? @relation(fields: [changed_by], references: [id], onDelete: SetNull)

  @@map("order_status_history")
}

model OrderItem {
  id            Int      @id @default(autoincrement())
  order_id      Int
  product_id    Int
  variant_id    Int?
  product_name  String   @db.VarChar(255)
  product_image String?  @db.VarChar(255)
  quantity      Int
  price         Decimal  @db.Decimal(10, 2)
  subtotal      Decimal  @db.Decimal(10, 2)
  created_at    DateTime @default(now())

  order   Order           @relation(fields: [order_id], references: [id], onDelete: Cascade)
  product Product         @relation(fields: [product_id], references: [id], onDelete: Restrict)
  variant ProductVariant? @relation(fields: [variant_id], references: [id], onDelete: Restrict)

  @@map("order_items")
}

model Payment {
  id               Int      @id @default(autoincrement())
  order_id         Int      @unique
  payment_method   String   @db.VarChar(50)
  transaction_id   String?  @db.VarChar(100)
  amount           Decimal  @db.Decimal(10, 2)
  payment_status   String?  @default("pending") @db.VarChar(50)
  gateway_response String?  @db.Text
  created_at       DateTime @default(now())

  order Order @relation(fields: [order_id], references: [id], onDelete: Cascade)

  @@map("payments")
}

model Inventory {
  id                Int      @id @default(autoincrement())
  product_id        Int
  variant_id        Int?
  stock_quantity    Int      @default(0)
  reserved_quantity Int      @default(0)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  product Product         @relation(fields: [product_id], references: [id], onDelete: Cascade)
  variant ProductVariant? @relation(fields: [variant_id], references: [id], onDelete: Cascade)

  @@unique([product_id, variant_id], name: "uq_product_variant_inventory")
  @@map("inventory")
}

model StockMovement {
  id             Int      @id @default(autoincrement())
  product_id     Int
  type           String   @db.VarChar(50)
  quantity       Int
  reference_type String?  @db.VarChar(50)
  reference_id   Int?
  created_at     DateTime @default(now())

  product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)

  @@map("stock_movements")
}

model Shipment {
  id              Int      @id @default(autoincrement())
  order_id        Int      @unique
  courier_name    String?  @db.VarChar(100)
  tracking_number String?  @db.VarChar(100)
  shipping_status String?  @default("ready") @db.VarChar(50)
  shipped_at      DateTime?
  delivered_at    DateTime?
  created_at      DateTime @default(now())

  order Order @relation(fields: [order_id], references: [id], onDelete: Cascade)

  @@map("shipments")
}

model ReturnOrder {
  id         Int      @id @default(autoincrement())
  order_id   Int
  user_id    Int
  reason     String   @db.Text
  status     String?  @default("requested") @db.VarChar(50)
  created_at DateTime @default(now())

  order Order @relation(fields: [order_id], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("returns")
}

model Banner {
  id           Int      @id @default(autoincrement())
  title        String   @db.VarChar(255)
  image        String   @db.VarChar(255)
  mobile_image String?  @db.VarChar(255)
  redirect_url String?  @db.VarChar(255)
  position     String   @db.VarChar(50)
  sort_order   Int?     @default(0)
  status       String?  @default("active") @db.VarChar(20)
  start_date   DateTime
  end_date     DateTime
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  @@map("banners")
}

model HomepageSection {
  id           Int      @id @default(autoincrement())
  title        String   @db.VarChar(255)
  section_type String   @db.VarChar(100)
  sort_order   Int?     @default(0)
  status       String?  @default("active") @db.VarChar(20)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  featured_products FeaturedProduct[]

  @@map("homepage_sections")
}

model FeaturedProduct {
  id         Int      @id @default(autoincrement())
  product_id Int
  section_id Int
  sort_order Int?     @default(0)
  created_at DateTime @default(now())

  product Product         @relation(fields: [product_id], references: [id], onDelete: Cascade)
  section HomepageSection @relation(fields: [section_id], references: [id], onDelete: Cascade)

  @@map("featured_products")
}

model Offer {
  id                   Int      @id @default(autoincrement())
  name                 String   @db.VarChar(255)
  description          String?  @db.VarChar(500)
  offer_type           String   @db.VarChar(50)
  discount_type        String   @db.VarChar(20)
  discount_value       Decimal  @db.Decimal(10, 2)
  minimum_order_amount Decimal  @default(0.00) @db.Decimal(10, 2)
  maximum_discount     Decimal? @db.Decimal(10, 2)
  start_date           DateTime
  end_date             DateTime
  status               String?  @default("active") @db.VarChar(20)
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt

  products   OfferProduct[]
  categories OfferCategory[]

  @@map("offers")
}

model OfferProduct {
  id         Int @id @default(autoincrement())
  offer_id   Int
  product_id Int

  offer   Offer   @relation(fields: [offer_id], references: [id], onDelete: Cascade)
  product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)

  @@map("offer_products")
}

model OfferCategory {
  id          Int @id @default(autoincrement())
  offer_id    Int
  category_id Int

  offer    Offer    @relation(fields: [offer_id], references: [id], onDelete: Cascade)
  category Category @relation(fields: [category_id], references: [id], onDelete: Cascade)

  @@map("offer_categories")
}

model AuditLog {
  id          Int      @id @default(autoincrement())
  user_id     Int?
  module      String   @db.VarChar(100)
  action      String   @db.VarChar(100)
  description String   @db.Text
  old_data    String?  @db.Text
  new_data    String?  @db.Text
  ip_address  String?  @db.VarChar(50)
  user_agent  String?  @db.VarChar(500)
  created_at  DateTime @default(now())

  user User? @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}

model UserSession {
  id            Int      @id @default(autoincrement())
  user_id       Int
  device_name   String?  @db.VarChar(255)
  ip_address    String?  @db.VarChar(50)
  user_agent    String?  @db.VarChar(500)
  refresh_token String?  @db.VarChar(500)
  expires_at    DateTime
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model MediaFile {
  id         Int      @id @default(autoincrement())
  user_id    Int
  file_name  String   @db.VarChar(255)
  file_path  String   @db.VarChar(255)
  file_type  String   @db.VarChar(50)
  file_size  Int
  folder     String   @db.VarChar(100)
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("media_files")
}

model Notification {
  id         Int      @id @default(autoincrement())
  user_id    Int
  title      String   @db.VarChar(255)
  message    String   @db.Text
  type       String   @db.VarChar(50)
  is_read    Boolean  @default(false)
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model UserBehaviour {
  id         Int      @id @default(autoincrement())
  user_id    Int
  product_id Int
  action     String   @db.VarChar(30)
  session_id String?  @db.VarChar(100)
  source     String?  @db.VarChar(50)
  created_at DateTime @default(now())

  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)

  @@map("user_behaviour")
}

model AnalyticsEvent {
  id         Int      @id @default(autoincrement())
  user_id    Int?
  session_id String?  @db.VarChar(100)
  event_name String   @db.VarChar(100)
  event_data String?  @db.Text
  ip_address String?  @db.VarChar(45)
  user_agent String?  @db.VarChar(500)
  page_url   String?  @db.VarChar(500)
  referrer   String?  @db.VarChar(500)
  created_at DateTime @default(now())

  user User? @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@map("analytics_events")
}
`;

fs.writeFileSync('prisma/schema.prisma', schema + "\n" + newModels);
