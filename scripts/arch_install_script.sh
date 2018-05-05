sudo pacman -S nodejs mysql git npm

# db setup and config
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl enable mysqld.service
sudo systemctl start mysqld.service
mysql_secure_installation

# repo copy and db setup
cd ~
git clone https://github.com/BitCrunchers/marconicc
cd marconicc
git checkout develop
cd config
mysql -u root -p123 < composizione_classi.sql
mysql -u root -p123 < crea_utenti_e_permessi.sql

# repo config
cd ..
npm install
sudo npm install bower -g
cd public
bower install

cd ..

