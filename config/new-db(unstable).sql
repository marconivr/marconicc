-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2017 at 09:44 AM
-- Server version: 10.1.16-MariaDB
-- PHP Version: 5.6.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `composizione_classi`
--

DROP DATABASE IF EXISTS composizione_classi;
CREATE DATABASE composizione_classi;
USE composizione_classi;

-- --------------------------------------------------------

--
-- Table structure for table `alunni`
--

CREATE TABLE `alunni` (
  `id` int(11) NOT NULL,
  `cognome` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `matricola` varchar(50) NOT NULL,
  `cf` char(16) NOT NULL,
  `desiderata` char(16) DEFAULT NULL,
  `sesso` char(1) NOT NULL,
  `data_di_nascita` date NOT NULL,
  `cap` varchar(15) NOT NULL,
  `nazionalita` varchar(25) NOT NULL,
  `legge_107` varchar(25) DEFAULT NULL,
  `legge_104` varchar(25) DEFAULT NULL,
  `classe_precedente` varchar(5) DEFAULT NULL,
  `scelta_indirizzo` varchar(50) NOT NULL,
  `anno_scolastico` varchar(15) NOT NULL,
  `cod_cat` varchar(10) NOT NULL,
  `voto` int(1) NOT NULL,
  `classe_futura` varchar(50) NOT NULL,
  `scuola` int(11) DEFAULT NULL,
  `utente` int(11) DEFAULT NULL,
  `descrizione` varchar(500) DEFAULT NULL,
  `tag` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `alunni`
--


--
-- Table structure for table `classi`
--

CREATE TABLE `classi` (
  `id` int(11) NOT NULL,
  `nome` varchar(5) NOT NULL,
  `anno_scolastico` varchar(15) NOT NULL,
  `descrizione` varchar(100) DEFAULT NULL,
  `scuola` int(11) DEFAULT NULL,
  `classe_futura` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `classi_composte`
--

CREATE TABLE `classi_composte` (
  `classe` int(11) NOT NULL,
  `alunno` int(11) NOT NULL,
  `configurazione` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `configurazione`
--

CREATE TABLE `configurazione` (
  `id` int(11) NOT NULL,
  `attiva` int DEFAULT 0,
  `scuola` int(11) DEFAULT NULL,
  `anno_scolastico` varchar(15) DEFAULT NULL,
  `data` date NOT NULL,
  `nome` varchar(100) NOT NULL,
  `min_alunni` int(11) NOT NULL,
  `max_alunni` int(11) NOT NULL,
  `gruppo_femmine` int(11) DEFAULT NULL,
  `gruppo_cap` int(11) DEFAULT NULL,
  `gruppo_nazionalita` int(11) DEFAULT NULL,
  `nazionalita_per_classe` int(11) DEFAULT NULL,
  `numero_alunni_con_104` int(11) DEFAULT NULL,
  `classe` varchar(25) NOT NULL COMMENT 'PRIMA = prime , TERZA = terze'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `configurazione`
--

INSERT INTO `configurazione` (`id`, `attiva`, `scuola`, `anno_scolastico`, `data`, `nome`, `min_alunni`, `max_alunni`, `gruppo_femmine`, `gruppo_cap`, `gruppo_nazionalita`, `nazionalita_per_classe`, `numero_alunni_con_104`, `classe`) VALUES
(1, 1, 0, '2017-2018', '2017-05-09', 'Default config', 25, 28, 4, 4, 4, 3, 23, 'PRIMA');

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` int(11) NOT NULL,
  `alunno` int(11) DEFAULT NULL,
  `classe_precedente` int(11) DEFAULT NULL,
  `classe_successiva` int(11) DEFAULT NULL,
  `scuola` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `utente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `indirizzi`
--

CREATE TABLE `indirizzi` (
  `id` int(11) NOT NULL,
  `indirizzo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `indirizzi`
--

INSERT INTO `indirizzi` (`id`, `indirizzo`) VALUES
(1, 'informatica'),
(2, 'logistica');

-- --------------------------------------------------------

--
-- Table structure for table `indirizzi_configurazione`
--

CREATE TABLE `indirizzi_configurazione` (
  `configurazione` int(11) NOT NULL,
  `indirizzo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `indirizzi_configurazione`
--

INSERT INTO `indirizzi_configurazione` (`configurazione`, `indirizzo`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `scuole`
--

CREATE TABLE `scuole` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `indirizzo` varchar(255) NOT NULL,
  `email` varchar(50) NOT NULL,
  `numero_di_telefono` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `scuole`
--

INSERT INTO `scuole` (`id`, `nome`, `descrizione`, `indirizzo`, `email`, `numero_di_telefono`) VALUES
(0, 'ITIS G. Marconi', 'scuola superiore di Verona(informatica,logistica,elettronica)', 'piazzale Guardini 7, Vr', 'gmarconi@marconivr.it', '0456500190');

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `scuola` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tag`
--

INSERT INTO `tag` (`id`, `type`, `scuola`) VALUES
(1, 'religione sikh', 0),
(4, 'buddista', 0);

-- --------------------------------------------------------

--
-- Table structure for table `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` char(60) NOT NULL,
  `diritti` int(11) NOT NULL COMMENT '0 = admin 1 = modifica 2 = visualizza',
  `scuola` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `utenti`
--

INSERT INTO `utenti` (`id`, `username`, `password`, `diritti`, `scuola`) VALUES
(5, 'root', '$2a$10$9TwgVRUMdBjpajCtXb7sWOmQ5JZqkxYKwMcB5TbMUW8MnkU3jWApy', 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alunni`
--
ALTER TABLE `alunni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scuola` (`scuola`),
  ADD KEY `utente` (`utente`),
  ADD KEY `tag_fk` (`tag`);

--
-- Indexes for table `classi`
--
ALTER TABLE `classi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`,`scuola`,`anno_scolastico`),
  ADD KEY `scuola` (`scuola`);

--
-- Indexes for table `classi_composte`
--
ALTER TABLE `classi_composte`
  ADD PRIMARY KEY (`classe`,`alunno`),
  ADD KEY `alunno` (`alunno`),
  ADD KEY `configurazione` (`configurazione`);

--
-- Indexes for table `configurazione`
--
ALTER TABLE `configurazione`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scuola` (`scuola`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alunno` (`alunno`),
  ADD KEY `classe_precedente` (`classe_precedente`),
  ADD KEY `classe_successiva` (`classe_successiva`),
  ADD KEY `scuola` (`scuola`),
  ADD KEY `utente` (`utente`);

--
-- Indexes for table `indirizzi`
--
ALTER TABLE `indirizzi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indirizzi_configurazione`
--
ALTER TABLE `indirizzi_configurazione`
  ADD PRIMARY KEY (`configurazione`,`indirizzo`),
  ADD KEY `indirizzo` (`indirizzo`);

--
-- Indexes for table `scuole`
--
ALTER TABLE `scuole`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scuola` (`scuola`);

--
-- Indexes for table `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utenti_ibfk_1` (`scuola`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alunni`
--
ALTER TABLE `alunni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=304;
--
-- AUTO_INCREMENT for table `classi`
--
ALTER TABLE `classi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
--
-- AUTO_INCREMENT for table `configurazione`
--
ALTER TABLE `configurazione`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `indirizzi`
--
ALTER TABLE `indirizzi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `scuole`
--
ALTER TABLE `scuole`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tag`
--
ALTER TABLE `tag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `alunni`
--
ALTER TABLE `alunni`
  ADD CONSTRAINT `alunni_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`),
  ADD CONSTRAINT `alunni_ibfk_2` FOREIGN KEY (`utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `tag_fk` FOREIGN KEY (`tag`) REFERENCES `tag` (`id`);

--
-- Constraints for table `classi`
--
ALTER TABLE `classi`
  ADD CONSTRAINT `classi_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`);

--
-- Constraints for table `classi_composte`
--
ALTER TABLE `classi_composte`
  ADD CONSTRAINT `classi_composte_ibfk_1` FOREIGN KEY (`classe`) REFERENCES `classi` (`id`),
  ADD CONSTRAINT `classi_composte_ibfk_2` FOREIGN KEY (`alunno`) REFERENCES `alunni` (`id`),
  ADD CONSTRAINT `classi_composte_ibfk_3` FOREIGN KEY (`configurazione`) REFERENCES `configurazione` (`id`) on DELETE CASCADE;

--
-- Constraints for table `configurazione`
--
ALTER TABLE `configurazione`
  ADD CONSTRAINT `configurazione_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`alunno`) REFERENCES `alunni` (`id`),
  ADD CONSTRAINT `history_ibfk_2` FOREIGN KEY (`classe_precedente`) REFERENCES `classi` (`id`),
  ADD CONSTRAINT `history_ibfk_3` FOREIGN KEY (`classe_successiva`) REFERENCES `classi` (`id`),
  ADD CONSTRAINT `history_ibfk_4` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`),
  ADD CONSTRAINT `history_ibfk_5` FOREIGN KEY (`utente`) REFERENCES `utenti` (`id`);

--
-- Constraints for table `indirizzi_configurazione`
--
ALTER TABLE `indirizzi_configurazione`
  ADD CONSTRAINT `indirizzi_configurazione_ibfk_1` FOREIGN KEY (`configurazione`) REFERENCES `configurazione`  (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `indirizzi_configurazione_ibfk_2` FOREIGN KEY (`indirizzo`) REFERENCES `indirizzi` (`id`);

--
-- Constraints for table `tag`
--
ALTER TABLE `tag`
  ADD CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`);

--
-- Constraints for table `utenti`
--
ALTER TABLE `utenti`
  ADD CONSTRAINT `scuola_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`),
  ADD CONSTRAINT `utenti_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`);-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2017 at 09:44 AM
-- Server version: 10.1.16-MariaDB
-- PHP Version: 5.6.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `composizione_classi`
--

DROP DATABASE IF EXISTS composizione_classi;
CREATE DATABASE composizione_classi;
USE composizione_classi;

-- --------------------------------------------------------

--
-- Table structure for table `alunni`
--

CREATE TABLE `alunni` (
  `id` int(11) NOT NULL,
  `cognome` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `matricola` varchar(50) NOT NULL,
  `cf` char(16) NOT NULL,
  `desiderata` char(16) DEFAULT NULL,
  `sesso` char(1) NOT NULL,
  `data_di_nascita` date NOT NULL,
  `cap` varchar(15) NOT NULL,
  `nazionalita` varchar(25) NOT NULL,
  `legge_107` varchar(25) DEFAULT NULL,
  `legge_104` varchar(25) DEFAULT NULL,
  `classe_precedente` varchar(5) DEFAULT NULL,
  `scelta_indirizzo` varchar(50) NOT NULL,
  `anno_scolastico` varchar(15) NOT NULL,
  `cod_cat` varchar(10) NOT NULL,
  `voto` int(1) NOT NULL,
  `classe_futura` varchar(50) NOT NULL,
  `scuola` int(11) DEFAULT NULL,
  `utente` int(11) DEFAULT NULL,
  `descrizione` varchar(500) DEFAULT NULL,
  `tag` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `alunni`
--

-- --------------------------------------------------------

--
-- Table structure for table `classi`
--

CREATE TABLE `classi` (
  `id` int(11) NOT NULL,
  `nome` varchar(5) NOT NULL,
  `anno_scolastico` varchar(15) NOT NULL,
  `descrizione` varchar(100) DEFAULT NULL,
  `scuola` int(11) DEFAULT NULL,
  `classe_futura` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `classi_composte`
--

CREATE TABLE `classi_composte` (
  `classe` int(11) NOT NULL,
  `alunno` int(11) NOT NULL,
  `configurazione` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `configurazione`
--

CREATE TABLE `configurazione` (
  `id` int(11) NOT NULL,
  `attiva` int DEFAULT 0,
  `scuola` int(11) DEFAULT NULL,
  `anno_scolastico` varchar(15) DEFAULT NULL,
  `data` date NOT NULL,
  `nome` varchar(100) NOT NULL,
  `min_alunni` int(11) NOT NULL,
  `max_alunni` int(11) NOT NULL,
  `gruppo_femmine` int(11) DEFAULT NULL,
  `gruppo_cap` int(11) DEFAULT NULL,
  `gruppo_nazionalita` int(11) DEFAULT NULL,
  `nazionalita_per_classe` int(11) DEFAULT NULL,
  `numero_alunni_con_104` int(11) DEFAULT NULL,
  `classe` varchar(25) NOT NULL COMMENT 'PRIMA = prime , TERZA = terze'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `configurazione`
--

INSERT INTO `configurazione` (`id`, `attiva`, `scuola`, `anno_scolastico`, `data`, `nome`, `min_alunni`, `max_alunni`, `gruppo_femmine`, `gruppo_cap`, `gruppo_nazionalita`, `nazionalita_per_classe`, `numero_alunni_con_104`, `classe`) VALUES
(1, 1, 0, '2017-2018', '2017-05-09', 'Default config', 25, 28, 4, 4, 4, 3, 23, 'PRIMA');

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` int(11) NOT NULL,
  `alunno` int(11) DEFAULT NULL,
  `classe_precedente` int(11) DEFAULT NULL,
  `classe_successiva` int(11) DEFAULT NULL,
  `scuola` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `utente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `indirizzi`
--

CREATE TABLE `indirizzi` (
  `id` int(11) NOT NULL,
  `indirizzo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `indirizzi`
--

INSERT INTO `indirizzi` (`id`, `indirizzo`) VALUES
(1, 'informatica'),
(2, 'logistica');

-- --------------------------------------------------------

--
-- Table structure for table `indirizzi_configurazione`
--

CREATE TABLE `indirizzi_configurazione` (
  `configurazione` int(11) NOT NULL,
  `indirizzo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `indirizzi_configurazione`
--

INSERT INTO `indirizzi_configurazione` (`configurazione`, `indirizzo`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `scuole`
--

CREATE TABLE `scuole` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `indirizzo` varchar(255) NOT NULL,
  `email` varchar(50) NOT NULL,
  `numero_di_telefono` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `scuole`
--

INSERT INTO `scuole` (`id`, `nome`, `descrizione`, `indirizzo`, `email`, `numero_di_telefono`) VALUES
(0, 'ITIS G. Marconi', 'scuola superiore di Verona(informatica,logistica,elettronica)', 'piazzale Guardini 7, Vr', 'gmarconi@marconivr.it', '0456500190');

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `scuola` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tag`
--

INSERT INTO `tag` (`id`, `type`, `scuola`) VALUES
(1, 'religione sikh', 0),
(4, 'buddista', 0);

-- --------------------------------------------------------

--
-- Table structure for table `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` char(60) NOT NULL,
  `diritti` int(11) NOT NULL COMMENT '0 = admin 1 = modifica 2 = visualizza',
  `scuola` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `utenti`
--

INSERT INTO `utenti` (`id`, `username`, `password`, `diritti`, `scuola`) VALUES
(5, 'root', '$2a$10$9TwgVRUMdBjpajCtXb7sWOmQ5JZqkxYKwMcB5TbMUW8MnkU3jWApy', 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alunni`
--
ALTER TABLE `alunni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scuola` (`scuola`),
  ADD KEY `utente` (`utente`),
  ADD KEY `tag_fk` (`tag`);

--
-- Indexes for table `classi`
--
ALTER TABLE `classi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`,`scuola`,`anno_scolastico`),
  ADD KEY `scuola` (`scuola`);

--
-- Indexes for table `classi_composte`
--
ALTER TABLE `classi_composte`
  ADD PRIMARY KEY (`classe`,`alunno`),
  ADD KEY `alunno` (`alunno`),
  ADD KEY `configurazione` (`configurazione`);

--
-- Indexes for table `configurazione`
--
ALTER TABLE `configurazione`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scuola` (`scuola`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alunno` (`alunno`),
  ADD KEY `classe_precedente` (`classe_precedente`),
  ADD KEY `classe_successiva` (`classe_successiva`),
  ADD KEY `scuola` (`scuola`),
  ADD KEY `utente` (`utente`);

--
-- Indexes for table `indirizzi`
--
ALTER TABLE `indirizzi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indirizzi_configurazione`
--
ALTER TABLE `indirizzi_configurazione`
  ADD PRIMARY KEY (`configurazione`,`indirizzo`),
  ADD KEY `indirizzo` (`indirizzo`);

--
-- Indexes for table `scuole`
--
ALTER TABLE `scuole`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scuola` (`scuola`);

--
-- Indexes for table `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utenti_ibfk_1` (`scuola`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alunni`
--
ALTER TABLE `alunni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=304;
--
-- AUTO_INCREMENT for table `classi`
--
ALTER TABLE `classi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
--
-- AUTO_INCREMENT for table `configurazione`
--
ALTER TABLE `configurazione`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `indirizzi`
--
ALTER TABLE `indirizzi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `scuole`
--
ALTER TABLE `scuole`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tag`
--
ALTER TABLE `tag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `alunni`
--
ALTER TABLE `alunni`
  ADD CONSTRAINT `alunni_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`),
  ADD CONSTRAINT `alunni_ibfk_2` FOREIGN KEY (`utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `tag_fk` FOREIGN KEY (`tag`) REFERENCES `tag` (`id`);

--
-- Constraints for table `classi`
--
ALTER TABLE `classi`
  ADD CONSTRAINT `classi_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`);

--
-- Constraints for table `classi_composte`
--
ALTER TABLE `classi_composte`
  ADD CONSTRAINT `classi_composte_ibfk_1` FOREIGN KEY (`classe`) REFERENCES `classi` (`id`),
  ADD CONSTRAINT `classi_composte_ibfk_2` FOREIGN KEY (`alunno`) REFERENCES `alunni` (`id`),
  ADD CONSTRAINT `classi_composte_ibfk_3` FOREIGN KEY (`configurazione`) REFERENCES `configurazione` (`id`) on DELETE CASCADE;

--
-- Constraints for table `configurazione`
--
ALTER TABLE `configurazione`
  ADD CONSTRAINT `configurazione_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`alunno`) REFERENCES `alunni` (`id`),
  ADD CONSTRAINT `history_ibfk_2` FOREIGN KEY (`classe_precedente`) REFERENCES `classi` (`id`),
  ADD CONSTRAINT `history_ibfk_3` FOREIGN KEY (`classe_successiva`) REFERENCES `classi` (`id`),
  ADD CONSTRAINT `history_ibfk_4` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`),
  ADD CONSTRAINT `history_ibfk_5` FOREIGN KEY (`utente`) REFERENCES `utenti` (`id`);

--
-- Constraints for table `indirizzi_configurazione`
--
ALTER TABLE `indirizzi_configurazione`
  ADD CONSTRAINT `indirizzi_configurazione_ibfk_1` FOREIGN KEY (`configurazione`) REFERENCES `configurazione`  (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `indirizzi_configurazione_ibfk_2` FOREIGN KEY (`indirizzo`) REFERENCES `indirizzi` (`id`);

--
-- Constraints for table `tag`
--
ALTER TABLE `tag`
  ADD CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`);

--
-- Constraints for table `utenti`
--
ALTER TABLE `utenti`
  ADD CONSTRAINT `scuola_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`),
  ADD CONSTRAINT `utenti_ibfk_1` FOREIGN KEY (`scuola`) REFERENCES `scuole` (`id`);