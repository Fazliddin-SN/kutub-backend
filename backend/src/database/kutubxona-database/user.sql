
-- Create ENUM types
CREATE TYPE role AS ENUM ('user', 'admin', 'owner');


-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(50) UNIQUE NOT NULL,
    role role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERTING USERS 

INSERT INTO users (full_name, username, email, password, address, phoneNumber, role, created_at) VALUES
('Ali Valiyev', 'ali123', 'ali.valiyev@example.com', 'hashedpassword1', 'Tashkent, Uzbekistan', '+998901234567', 'owner', NOW()),
('Madina Karimova', 'madina_k', 'madina.karimova@example.com', 'hashedpassword2', 'Samarkand, Uzbekistan', '+998902345678', 'admin', NOW()),
('Javohir Saidov', 'javohir_s', 'javohir.saidov@example.com', 'hashedpassword3', 'Bukhara, Uzbekistan', '+998903456789', 'user', NOW()),
('Zarina Abdullayeva', 'zarina_a', 'zarina.abdullayeva@example.com', 'hashedpassword4', 'Namangan, Uzbekistan', '+998904567890', 'user', NOW()),
('Bekzod Rakhimov', 'bekzod_r', 'bekzod.rakhimov@example.com', 'hashedpassword5', 'Fergana, Uzbekistan', '+998905678901', 'owner', NOW()),
('Nilufar Yoqubova', 'nilufar_y', 'nilufar.yoqubova@example.com', 'hashedpassword6', 'Andijan, Uzbekistan', '+998906789012', 'admin', NOW()),
('Olim Toshev', 'olim_t', 'olim.toshev@example.com', 'hashedpassword7', 'Khorezm, Uzbekistan', '+998907890123', 'user', NOW()),
('Shahzod Mamadaliyev', 'shahzod_m', 'shahzod.mamadaliyev@example.com', 'hashedpassword8', 'Navoiy, Uzbekistan', '+998908901234', 'admin', NOW()),
('Umida Tursunova', 'umida_t', 'umida.tursunova@example.com', 'hashedpassword9', 'Jizzakh, Uzbekistan', '+998909012345', 'user', NOW()),
('Sardor Ergashev', 'sardor_e', 'sardor.ergashev@example.com', 'hashedpassword10', 'Surxondaryo, Uzbekistan', '+998901112233', 'owner', NOW());



