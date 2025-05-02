const { pool } = require("../config/db");
require("dotenv").config();

const createTables = async () => {
  try {
    console.log("🔄 Creating tables...");

    await pool.query(`
      -- ENUM Types
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'admin', 'owner');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE book_status AS ENUM ('mavjud', 'ijarada', 'kechikkan');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE rental_status AS ENUM ('jarayonda', 'qaytarildi');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
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
      CREATE TABLE IF NOT EXISTS categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(80) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Libraries table
      CREATE TABLE IF NOT EXISTS libraries (
        library_id SERIAL PRIMARY KEY,
        library_name VARCHAR(100) UNIQUE NOT NULL,
        owner_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      -- Books table
      CREATE TABLE IF NOT EXISTS books (
        book_id SERIAL PRIMARY KEY,
        title VARCHAR(255) UNIQUE NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(50) UNIQUE NOT NULL,
        category_id INT NOT NULL,
        publication_date DATE,
        image_path VARCHAR(100),
        status book_status DEFAULT 'mavjud',
        read_count INT NOT NULL DEFAULT 0,
        library_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (library_id) REFERENCES libraries(library_id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
      );

      -- Rentals table
      CREATE TABLE IF NOT EXISTS rentals (
        rental_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        owner_id INT NOT NULL,
        rental_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE,
        return_date DATE,
        actual_return_date TIMESTAMP NULL,
        status rental_status DEFAULT 'jarayonda',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      -- Library members table
      CREATE TABLE IF NOT EXISTS library_members (
        library_member_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        library_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (library_id) REFERENCES libraries(library_id) ON DELETE CASCADE
      );

      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        comment_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        comment VARCHAR(250) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
      );
      -- Requests table
      CREATE TABLE IF NOT EXISTS requests (
      request_id SERIAL PRIMARY KEY,
      user_email VARCHAR(60) NOT NULL,
      owner_id INT NOT NULL,
      book_id INT NOT NULL,
      message VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
      notification_id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(user_id),
      rental_id INT NOT NULL REFERENCES rentals(rental_id),
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


      INSERT INTO users (full_name, username, email, password, address, phoneNumber, role) VALUES ('Rajabov Husan', 'husan_01', 'husan@gmail.com', '$2b$10$KDyJ5r8xzslqA1gccHhBVuY5brKElc8KN91LkJl76wj5qjY1Sun1K', 'Jizzakh', '+998949632147', 'admin');
      -- categories table data 

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
      ('Diniy', NOW()) ON CONFLICT (category_name) DO NOTHING;

    `);
    console.log("✅ All tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    pool.end(); // Close connection
  }
};

// Run the function
createTables();
