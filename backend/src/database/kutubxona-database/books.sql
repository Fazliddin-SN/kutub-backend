-- BOOK_STATUS
CREATE TYPE book_status AS ENUM ('mavjud', 'ijarada');
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
    oqilgan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (library_id) REFERENCES libraries(library_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

--- INSERTING 
INSERT INTO books (title, author, isbn, category_id, publication_date, image_path, status, library_id, created_at) VALUES
('Sehrgarlar Shohligi', 'J.K. Rowling', '978-1-234567-01-1', 1, '2007-07-21', '/images/book1.jpg', 'mavjud', 1, NOW()),
('Kelajakka Sayohat', 'Isaac Asimov', '978-1-234567-02-2', 2, '1950-01-01', '/images/book2.jpg', 'mavjud', 2, NOW()),
('Qahramonning Sarguzashtlari', 'Jules Verne', '978-1-234567-03-3', 3, '1873-01-30', '/images/book3.jpg', 'mavjud', 3, NOW()),
('Buyuk Imperiyalar Tarixi', 'Will Durant', '978-1-234567-04-4', 4, '1967-06-10', '/images/book4.jpg', 'mavjud', 2, NOW()),
('Tungi Qorquv', 'Stephen King', '978-1-234567-05-5', 5, '1986-09-15', '/images/book5.jpg', 'mavjud', 1, NOW()),
('Sirli Jinoyat', 'Agatha Christie', '978-1-234567-06-6', 6, '1934-11-01', '/images/book6.jpg', 'mavjud', 1, NOW()),
('Sevgi Hikoyalari', 'Nicholas Sparks', '978-1-234567-07-7', 7, '2002-02-14', '/images/book7.jpg', 'mavjud', 3, NOW()),
('Hayot va Muhabbat', 'Lev Tolstoy', '978-1-234567-08-8', 8, '1869-01-01', '/images/book8.jpg', 'mavjud', 3, NOW()),
('Otmishga Sayohat', 'Yuval Noah Harari', '978-1-234567-09-9', 9, '2014-09-04', '/images/book9.jpg', 'mavjud', 2, NOW()),
('Inson Ruhiyoti', 'Sigmund Freud', '978-1-234567-10-0', 10, '1920-04-21', '/images/book10.jpg', 'mavjud', 1, NOW()),
('Pul va Muvaffaqiyat', 'Robert Kiyosaki', '978-1-234567-11-1', 11, '1997-04-08', '/images/book11.jpg', 'mavjud', 1, NOW());


-- qidiruv kategoriyalar orqali . 'Tarix'riga  tegishli kitoblarni chiqarish uchun yonaltirilgan. 
 select * from b.* from books b inner join categories c on b.category_id = c.category_id where c.category_name = 'Tarix';