-- CATEGORIES TABLE

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (category_name, created_at) VALUES
('Fantastika', NOW()),
('Ilmiy-fantastika', NOW()),
('Sarguzasht', NOW()),
('Tarixiy asarlar', NOW()),
('Triller', NOW()),
('Detektiv', NOW()),
('Romantika', NOW()),
('Dramatik', NOW()),
('Tarix', NOW()),
('Psixologiya', NOW()),
('Iqtisodiyot va biznes', NOW()),
('Sogliq va tibbiyot', NOW()),
('Kompyuter va dasturlash', NOW()),
('Matematika va fizika', NOW()),
('Biografiya va xotiralar', NOW()),
('Oz-ozini rivojlantirish', NOW()),
('Sayohat va turizm', NOW()),
("Diniy", NOW());
