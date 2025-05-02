-- Rentals table 
CREATE TYPE rental_status AS ENUM ('active', 'qaytarilgan');
CREATE TABLE rentals (
    rental_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rental_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    return_date DATE,
    status rental_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

-- INSERTING 

INSERT INTO rentals (user_id, book_id, rental_date, due_date, return_date, status, created_at) VALUES
(2, 5, '2024-02-10', '2024-02-20', NULL, 'active', NOW()),
(3, 8, '2024-02-12', '2024-02-22', '2024-02-21', 'qaytarilgan', NOW()),
(4, 8, '2024-02-15', '2024-02-25', NULL, 'active', NOW()),
(5, 7, '2024-02-18', '2024-02-28', NULL, 'active', NOW()),
(6, 4, '2024-02-20', '2024-03-01', '2024-02-29', 'qaytarilgan', NOW()),
(7, 3, '2024-02-22', '2024-03-03', NULL, 'active', NOW()),
(8, 2, '2024-02-25', '2024-03-07', NULL, 'active', NOW()),
(9, 3, '2024-02-28', '2024-03-10', '2024-03-09', 'qaytarilgan', NOW());
