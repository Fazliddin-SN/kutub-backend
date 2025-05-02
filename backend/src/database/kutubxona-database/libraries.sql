--- LIBRARIES TABLE


CREATE TABLE libraries (
    library_id SERIAL PRIMARY KEY,
    library_name VARCHAR(100) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- ISNERTING
INSERT INTO libraries (library_name, owner_id, created_at) VALUES
('Ali library', 1, NOW()), ('Bekhzod Books', 5, NOW()), ('Sardor lib', 10,NOW());