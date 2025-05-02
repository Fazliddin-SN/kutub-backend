--database/schema.sql

--Users table

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books tabele

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    genre VARCHAR(50),
    publication_date DATE,
    status VARCHAR(50) DEFAULT 'available',
    library_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (library_id) REFERENCES libraries(id)
);

-- Rentals table 

CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    rental_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

ALTER TABLE rentals 
DROP CONSTRAINT rentals_book_id_fkey, 
ADD CONSTRAINT rentals_book_id_fkey FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL;
ALTER TABLE rentals 
DROP CONSTRAINT rentals_book_id_fkey, 
ADD CONSTRAINT rentals_book_id_fkey FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
