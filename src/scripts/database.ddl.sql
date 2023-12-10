-- Data Definition Language


-- permit in app --
-- dashboard	: trang chủ
-- stock		: quản lý kho
-- medicine		: quản lý thuốc
-- product		: quản lý sản phẩm
-- dose			: quản lý liều thuốc
-- category		: quản lý danh mục
-- sell			: bán hàng
-- account		: quản lý tài khoản

CREATE TABLE permission(
	permission_id SERIAL,
	permission_name VARCHAR(100) NOT NULL,
	PRIMARY KEY (permission_id)
)

-- create enum role
CREATE TYPE tp_role AS ENUM ('USER', 'STAFF', 'ADMIN');
-- create enum item type
CREATE TYPE tp_item_type AS ENUM('PRODUCT', 'MEDICINE')

-- select enum_range(null::tp_role)

-- create uuid-ossp module
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
	user_id UUID DEFAULT uuid_generate_v4(),
	role tp_role NOT NULL DEFAULT 'USER',
	email TEXT NOT NULL UNIQUE,
	name VARCHAR(20),
	full_name VARCHAR(40),
	password TEXT NOT NULL,
	gender BOOLEAN,
	date_of_birth DATE,
	phone_number VARCHAR(20),
	avatar TEXT DEFAULT 'https://res.cloudinary.com/dwskvqnkc/image/upload/v1702204312/mediserve_image_store/avatar-default-icon_mfpilp.png',
	certificate TEXT,
	identity_card TEXT,
	num_of_ppc TEXT,
	address TEXT,
	refresh_token TEXT DEFAULT '',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id)
)


CREATE TABLE permit(
	permission_id INT NOT NULL,
	user_id UUID NOT NULL,
	PRIMARY KEY(permission_id, user_id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE guest(
	guest_id SERIAL,
	full_name VARCHAR(40),
	gender BOOLEAN,
	age INTEGER,
	address TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (guest_id)
)


CREATE TABLE invoice_into_stock(
	invoice_into_stock_id SERIAL,
	staff_id UUID NOT NULL,
	total_import_price	INTEGER NOT NULL,
	total_sell_price INTEGER NOT NULL,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (invoice_into_stock_id),
	CONSTRAINT fk_invoiceintostock_users FOREIGN KEY(staff_id) REFERENCES users(user_id) ON DELETE CASCADE
)


CREATE TABLE category(
	category_id SERIAL,
	category_name VARCHAR(40),
	is_medicine	BOOLEAN,
	is_default BOOLEAN,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (category_id)
)


CREATE TABLE unit(
	unit_id SERIAL,
	unit_name VARCHAR(20),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (unit_id)
)

CREATE TABLE item(
	item_id SERIAL,
	category_id INTEGER NOT NULL,
	item_name VARCHAR(100) NOT NULL,
	registration_number VARCHAR(40) NOT NULL,
	dosage_form	VARCHAR(40),
	product_content VARCHAR(100),
	chemical_name VARCHAR(100),
	chemical_code VARCHAR(40),
	packing_specification VARCHAR(40),
	bar_code TEXT,
	sell_unit VARCHAR(20),
	input_unit VARCHAR(20),
	apply_to_affected_area_code VARCHAR(40),
	apply_to_affected_area VARCHAR(40),
	item_function TEXT,
	item_image TEXT,
	is_prescription BOOLEAN NOT NULL,
	note TEXT,
	item_type tp_item_type NOT NULL DEFAULT 'PRODUCT',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (item_id),
	CONSTRAINT fk_item_category FOREIGN KEY(category_id) REFERENCES category(category_id) ON DELETE CASCADE
)



CREATE TABLE item_in_stock(
	item_in_stock_id SERIAL UNIQUE NOT NULL,
	invoice_into_stock_id INTEGER NOT NULL,
	item_id INTEGER NOT NULL,
	lot_number VARCHAR(40),
	manufacture_date DATE NOT NULL,
	expiration_date	DATE NOT NULL,
	import_quantity INTEGER,
	specification INTEGER,
	import_price INTEGER,
	sell_price	INTEGER,
	sold_quantity INTEGER,
	destroyed BOOLEAN,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (invoice_into_stock_id, item_id, item_in_stock_id),
	CONSTRAINT fk_itemintostock_invoiceintostock FOREIGN KEY(invoice_into_stock_id) REFERENCES invoice_into_stock(invoice_into_stock_id) ON DELETE CASCADE,
	CONSTRAINT fk_itemintostock_medicine FOREIGN KEY(item_id) REFERENCES item(item_id) ON DELETE CASCADE
)




CREATE TABLE receipt(
	receipt_id SERIAL,
	staff_id UUID NOT NULL,
	customer_id UUID,
	guest_id INTEGER, 
	total_payment INTEGER DEFAULT 0,
	given_by_customer INTEGER DEFAULT 0,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (receipt_id),
	CONSTRAINT fk_receipt_staff FOREIGN KEY(staff_id) REFERENCES users(user_id) ON DELETE CASCADE,
	CONSTRAINT fk_receipt_customer FOREIGN KEY(customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
	CONSTRAINT fk_receipt_guest FOREIGN KEY(guest_id) REFERENCES guest(guest_id) ON DELETE CASCADE
)


CREATE TABLE detail_receipt_item(
	receipt_id INTEGER NOT NULL,
	item_stock_id INTEGER NOT NULL,
	quantity INTEGER,
	total_price INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (receipt_id, item_stock_id),
	CONSTRAINT fk_detailreceipt_receipt FOREIGN KEY(receipt_id) REFERENCES receipt(receipt_id) ON DELETE CASCADE,
	CONSTRAINT fk_detailreceipt_item_stock FOREIGN KEY(item_stock_id) REFERENCES item_in_stock(item_in_stock_id) ON DELETE CASCADE
)




CREATE TABLE prescription(
	prescription_id SERIAL,
	staff_id UUID NOT NULL,
	diagnose TEXT NOT NULL,
	is_dose BOOLEAN DEFAULT false,
	total_price INTEGER,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (prescription_id),
	CONSTRAINT fk_prescription_staff FOREIGN KEY(staff_id) REFERENCES users(user_id) ON DELETE CASCADE
)



CREATE TABLE detail_receipt_prescription(
	receipt_id INTEGER NOT NULL,
	prescription_id INTEGER NOT NULL,
	quantity INTEGER,
	total_price INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (receipt_id, prescription_id),
	CONSTRAINT fk_receiptprescription_receipt FOREIGN KEY(receipt_id) REFERENCES receipt(receipt_id) ON DELETE CASCADE,
	CONSTRAINT fk_receiptprescription_prescription FOREIGN KEY(prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE
)


CREATE TABLE medicine_guide(
	medicine_id INTEGER NOT NULL,
	prescription_id INTEGER NOT NULL,
	morning REAL,
	noon REAL,
	night REAL,
	quantity INT,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (medicine_id, prescription_id),
	CONSTRAINT fk_medicineguide_medicine FOREIGN KEY(medicine_id) REFERENCES item(item_id) ON DELETE CASCADE,
	CONSTRAINT fk_medicine_guide_prescription FOREIGN KEY(prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE
)


CREATE TABLE medicine_guide_sell(
	medicine_stock_id INTEGER NOT NULL,
	prescription_id INTEGER NOT NULL,
	morning REAL,
	noon REAL,
	night REAL,
	quantity INT,
	total_price INT,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (medicine_stock_id, prescription_id),
	CONSTRAINT fk_medicineguide_medicine FOREIGN KEY(medicine_stock_id) REFERENCES item_in_stock(item_in_stock_id) ON DELETE CASCADE,
	CONSTRAINT fk_medicine_guide_prescription FOREIGN KEY(prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE
)
