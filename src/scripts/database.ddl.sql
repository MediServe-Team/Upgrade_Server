-- Data Definition Language


CREATE TABLE permit(
	permit_id SERIAL,
	permit_index INTEGER UNIQUE NOT NULL,
	permit_name VARCHAR(100) NOT NULL,
	PRIMARY KEY (permit_id)
)

-- permit in app --
-- dashboard	: trang chủ
-- stock		: quản lý kho
-- medicine		: quản lý thuốc
-- product		: quản lý sản phẩm
-- dose			: quản lý liều thuốc
-- category		: quản lý danh mục
-- sell			: bán hàng
-- account		: quản lý tài khoản


-- create enum role
CREATE TYPE tp_role AS ENUM ('USER', 'STAFF', 'ADMIN');

-- select enum_range(null::tp_role)

-- create uuid-ossp module
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
	user_id UUID DEFAULT uuid_generate_v4(),
	role tp_role NOT NULL,
	permit_list INTEGER ARRAY,
	email TEXT NOT NULL,
	password TEXT NOT NULL,
	name VARCHAR(20),
	full_name VARCHAR(40),
	gender BOOLEAN,
	age INTEGER,
	date_of_birth DATE,
	phone_number VARCHAR(20),
	avatar TEXT DEFAULT 'https://res.cloudinary.com/dwskvqnkc/image/upload/v1681721772/samples/MediSever/default-avatar_ahyatj.png',
	address TEXT,
	discount INTEGER DEFAULT 0,
	certificate TEXT,
	identity_card TEXT,
	number_of_pharmacy_practice_certificate TEXT,
	refresh_token TEXT DEFAULT '',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id)
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


CREATE TABLE medicine(
	medicine_id SERIAL,
	category_id INTEGER NOT NULL,
	medicine_name VARCHAR(100) NOT NULL,
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
	medicine_function TEXT,
	medicine_image TEXT,
	is_prescription BOOLEAN NOT NULL,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (medicine_id),
	CONSTRAINT fk_medicine_category FOREIGN KEY(category_id) REFERENCES category(category_id) ON DELETE CASCADE
)



CREATE TABLE product(
	product_id SERIAL,
	category_id INTEGER NOT NULL,
	product_name VARCHAR(100) NOT NULL,
	registration_number VARCHAR(40) NOT NULL,
	dosage_form	VARCHAR(40),
	product_content VARCHAR(100),
	chemical_name VARCHAR(100),
	chemical_code VARCHAR(40),
	packing_specification VARCHAR(40),
	bar_code TEXT,
	sell_unit VARCHAR(20),
	input_unit VARCHAR(20),
	product_function TEXT,
	product_image TEXT,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (product_id),
	CONSTRAINT fk_product_category FOREIGN KEY(category_id) REFERENCES category(category_id) ON DELETE CASCADE
)


CREATE TABLE medicine_into_stock(
	invoice_into_stock_id INTEGER NOT NULL,
	medicine_id INTEGER NOT NULL,
	lot_number VARCHAR(40),
	manufacture_date DATE NOT NULL,
	expiration_date	DATE NOT NULL,
	input_quantity INTEGER,
	specification INTEGER,
	import_price INTEGER,
	sell_price	INTEGER,
	sold_quantity INTEGER,
	destroyed BOOLEAN,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (invoice_into_stock_id, medicine_id),
	CONSTRAINT fk_medicineintostock_invoiceintostock FOREIGN KEY(invoice_into_stock_id) REFERENCES invoice_into_stock(invoice_into_stock_id) ON DELETE CASCADE,
	CONSTRAINT fk_medicineintostock_medicine FOREIGN KEY(medicine_id) REFERENCES medicine(medicine_id) ON DELETE CASCADE
)



CREATE TABLE product_into_stock(
	invoice_into_stock_id INTEGER NOT NULL,
	product_id INTEGER NOT NULL,
	lot_number VARCHAR(40),
	manufacture_date DATE NOT NULL,
	expiration_date	DATE NOT NULL,
	input_quantity INTEGER,
	specification INTEGER,
	import_price INTEGER,
	sell_price	INTEGER,
	sold_quantity INTEGER,
	destroyed BOOLEAN,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (invoice_into_stock_id, product_id),
	CONSTRAINT fk_productintostock_invoiceintostock FOREIGN KEY(invoice_into_stock_id) REFERENCES invoice_into_stock(invoice_into_stock_id) ON DELETE CASCADE,
	CONSTRAINT fk_productintostock_product FOREIGN KEY(product_id) REFERENCES product(product_id) ON DELETE CASCADE
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



CREATE TABLE detail_receipt_product(
	receipt_id INTEGER NOT NULL,
	product_id INTEGER NOT NULL,
	quantity INTEGER,
	total_price INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (receipt_id, product_id),
	CONSTRAINT fk_receiptproduct_receipt FOREIGN KEY(receipt_id) REFERENCES receipt(receipt_id) ON DELETE CASCADE,
	CONSTRAINT fk_receiptproduct_product FOREIGN KEY(product_id) REFERENCES product(product_id) ON DELETE CASCADE
)


CREATE TABLE detail_receipt_medicine(
	receipt_id INTEGER NOT NULL,
	medicine_id INTEGER NOT NULL,
	quantity INTEGER,
	total_price INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (receipt_id, medicine_id),
	CONSTRAINT fk_receiptmedicine_receipt FOREIGN KEY(receipt_id) REFERENCES receipt(receipt_id) ON DELETE CASCADE,
	CONSTRAINT fk_receiptmedicine_medicine FOREIGN KEY(medicine_id) REFERENCES medicine(medicine_id) ON DELETE CASCADE
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



CREATE TABLE prescription(
	prescription_id SERIAL,
	staff_id UUID NOT NULL,
	diagnose TEXT NOT NULL,
	is_dose BOOLEAN,
	total_price INTEGER,
	note TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (prescription_id),
	CONSTRAINT fk_prescription_staff FOREIGN KEY(staff_id) REFERENCES users(user_id) ON DELETE CASCADE
)


CREATE TABLE medicine_guide(
	medicine_id INTEGER NOT NULL,
	prescription_id INTEGER NOT NULL,
	morning REAL,
	noon REAL,
	night REAL,
	quantity INT,
	total_price INT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (medicine_id, prescription_id),
	CONSTRAINT fk_medicineguide_medicine FOREIGN KEY(medicine_id) REFERENCES medicine(medicine_id) ON DELETE CASCADE,
	CONSTRAINT fk_medicine_guide_prescription FOREIGN KEY(prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE
)
