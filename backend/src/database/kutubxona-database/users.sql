--database/schema.sql
-- database/schema.sql

-- Create ENUM types
CREATE TYPE role AS ENUM ('user', 'admin', 'owner');
CREATE TYPE book_status AS ENUM ('mavjud', 'ijarada');
CREATE TYPE rental_status AS ENUM ('olingan', 'qaytarilgan');

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(50) UNIQUE NOT NULL,
    role role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table 
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Libraries table
CREATE TABLE libraries (
    library_id SERIAL PRIMARY KEY,
    library_name VARCHAR(100) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Books table
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    category_id INT NOT NULL,
    publication_date DATE,
    image_path VARCHAR(100) NOT NULL,
    status book_status DEFAULT 'mavjud',
    library_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (library_id) REFERENCES libraries(library_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Rentals table 
CREATE TABLE rentals (
    rental_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rental_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    return_date DATE,
    status rental_status DEFAULT 'olingan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Library members table
CREATE TABLE library_members (
    library_member_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    library_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (library_id) REFERENCES libraries(library_id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    comment VARCHAR(250) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);



-- Badiiy adabiyot:

--     Fantastika
--     Ilmiy-fantastika
--     Sarguzasht
--     Tarixiy asarlar
--     Detektiv
--     Triller
--     Sevgi (Romantika)
--     Dramatik asarlar

-- Ilmiy-ommabop va akademik:

--     Tarix
--     Falsafa
--     Psixologiya
--     Iqtisodiyot va biznes
--     Sog‘liq va tibbiyot
--     Matematika va fizika
--     Kompyuter va dasturlash

-- Haqiqiy hayot va hujjatli adabiyot:

--     Biografiya va xotiralar
--     Haqiqiy jinoyatlar
--     O‘z-o‘zini rivojlantirish
--     Sayohat va turizm