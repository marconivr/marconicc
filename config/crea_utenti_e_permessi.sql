DROP USER IF EXISTS 'composizione_classi'@'localhost';
FLUSH PRIVILEGES;
CREATE USER 'composizione_classi'@'localhost' IDENTIFIED BY '5BFF9B615FBEDCD197BFB9371BB5A7D1';
GRANT ALL ON composizione_classi.* TO 'composizione_classi'@'localhost';
