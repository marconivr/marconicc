SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `composizione_classi`
--
CREATE DATABASE IF NOT EXISTS `composizione_classi` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `composizione_classi`;

-- --------------------------------------------------------
-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Creato il: Mar 02, 2017 alle 20:16
-- Versione del server: 10.1.13-MariaDB
-- Versione PHP: 7.0.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


--
-- Database: `composizione_classi`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `tag`
--

CREATE TABLE `tag` (
  `tag` varchar(25) PRIMARY KEY,
  `descrizione` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `tag`
--

INSERT INTO `tag` (`tag`, `descrizione`) VALUES
('DSA', 'non so'),
('dbms', 'non so'),
('DCD', 'non so');


--
-- Struttura della tabella `alunni`
--

DROP TABLE IF EXISTS `alunni`;
CREATE TABLE  `alunni` (

 `cognome` VARCHAR( 255 ) NOT NULL ,
 `nome` VARCHAR( 255 ) NOT NULL ,
 `matricola` INT(10) NOT NULL,
 `cf` CHAR( 16 ) NOT NULL ,
 `sesso` CHAR( 1 ) NOT NULL ,
 `data_di_nascita` DATE NOT NULL ,
 `stato` VARCHAR( 20 ) NOT NULL ,
 `cap_provenienza` INT( 5 ) NOT NULL ,
 `nazionalita` VARCHAR(25) NOT NULL,
 `legge_107` VARCHAR(25) NULL,
 `legge_104` VARCHAR(25) NULL,
 `scelta_indirizzo` VARCHAR( 50 ) NOT NULL ,
 `classe_precedente` VARCHAR( 5 ) NULL ,
 `anno_scolastico` VARCHAR( 15 ) NOT NULL ,
 `anno` VARCHAR( 4 ) NOT NULL ,
 `cod_cat` VARCHAR( 10 ) NOT NULL ,
 `media_voti` DOUBLE NOT NULL ,
 `condotta` INT(1) NULL,
 `classe_futura` VARCHAR( 50 ) NOT NULL ,
 `tag` VARCHAR( 25 ) ,
FOREIGN KEY (`tag`) REFERENCES tag(`tag`)
);
-- --------------------------------------------------------

--
-- Struttura della tabella `amici`
--

DROP TABLE IF EXISTS `amici`;
CREATE TABLE `amici` (
  `id` int(11) NOT NULL,
  `matricola_1` int(5) NOT NULL,
  `matricola_2` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `impostazioni`
--

DROP TABLE IF EXISTS `impostazioni`;
CREATE TABLE `impostazioni` (
  `id` int(11) NOT NULL,
  `min_alunni` int(11) DEFAULT NULL,
  `max_alunni` int(11) DEFAULT NULL,
  `max_femmine` int(11) DEFAULT NULL,
  `max_stranieri` int(11) DEFAULT NULL,
  `stessa_provenienza` int(11) DEFAULT NULL,
  `stessa_iniziale` int(11) DEFAULT NULL,
  `media_min` float DEFAULT NULL,
  `media_max` float DEFAULT NULL,
  `bocciati` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `priorita_scelta`
--

DROP TABLE IF EXISTS `priorita_scelta`;
CREATE TABLE `priorita_scelta` (
  `id` int(11) NOT NULL,
  `scelta` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `priorita_scelta`
--

INSERT INTO `priorita_scelta` (`id`, `scelta`) VALUES
(1, 'femmine'),
(2, 'stranieri'),
(3, 'bocciati'),
(4, 'alunni'),
(5, 'stessa_nazionalita'),
(6, 'media');

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` char(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2a$10$3M0dV7GC34Vjw5mi.24kOeTGEIQxb9n5/vPhmzRa/oOpWsxOB9F12'),
(2, 'root', '$2a$10$Ph6FEDvFVxcZXgD1TL6ufepr5k/LhYecorEy1KmWdNsIVjbHQUFBy'),
(3, 'taioli', '$2a$10$9PyQRGXKKTy0anT6dzynnuLjyY3hesRK3ODYOoYcFVfyr3l/5pxJq');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `alunni`
--
ALTER TABLE `alunni`
  ADD PRIMARY KEY (`cf`,`anno_scolastico`);

--
-- Indici per le tabelle `amici`
--
ALTER TABLE `amici`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `impostazioni`
--
ALTER TABLE `impostazioni`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `priorita_scelta`
--
ALTER TABLE `priorita_scelta`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `amici`
--
ALTER TABLE `amici`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT per la tabella `priorita_scelta`
--
ALTER TABLE `priorita_scelta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 25, 2017 at 12:34
-- Server version: 5.1.41
-- PHP Version: 5.3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


CREATE TABLE IF NOT EXISTS `richiesta_amico` (
  `id` int(11) NOT NULL,
  `alunno` char(16) DEFAULT NULL,
  `amico` char(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alunno` (`alunno`),
  KEY `amico` (`amico`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `richiesta_amico`
--

INSERT INTO `richiesta_amico` (`id`, `alunno`, `amico`) VALUES
(1, 'BCCMHL02M16F861K', 'BRTRCR02D03L781T'),
(2, 'BNTDGI03A09I775U', 'ZTTMTT03D16F861C');


CREATE TABLE `classi` (
nome varchar(5) primary key
);

CREATE TABLE comp_classi(
nome_classe varchar(5),
cf_alunno char(16),
primary key(nome_classe, cf_alunno),
foreign key (nome_classe) references classi(nome),
foreign key (cf_alunno) references alunni(cf)
);


