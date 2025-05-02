---LIBRARY MEMBERS
CREATE TABLE library_members (
    library_member_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    library_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (library_id) REFERENCES libraries(library_id)
);

--INSERTING
insert into library_members (user_id, library_id) values (3, 1), (3,2), (7, 1), (7, 3), (9, 1);