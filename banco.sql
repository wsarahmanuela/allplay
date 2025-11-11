CREATE DATABASE  IF NOT EXISTS `pi_bbd` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pi_bbd`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: pi_bbd
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `CPF` varchar(14) NOT NULL,
  `IDadm` int NOT NULL AUTO_INCREMENT,
  `clube_IDclube` int NOT NULL,
  PRIMARY KEY (`CPF`),
  UNIQUE KEY `IDadm` (`IDadm`),
  KEY `fk_administrador_clube1_idx` (`clube_IDclube`),
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE,
  CONSTRAINT `fk_administrador_clube1` FOREIGN KEY (`clube_IDclube`) REFERENCES `clube` (`IDclube`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atleta`
--

DROP TABLE IF EXISTS `atleta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atleta` (
  `CPF` varchar(14) NOT NULL,
  `IDatleta` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`CPF`),
  UNIQUE KEY `IDatleta` (`IDatleta`),
  CONSTRAINT `atleta_ibfk_1` FOREIGN KEY (`CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atleta`
--

LOCK TABLES `atleta` WRITE;
/*!40000 ALTER TABLE `atleta` DISABLE KEYS */;
/*!40000 ALTER TABLE `atleta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clube`
--

DROP TABLE IF EXISTS `clube`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clube` (
  `IDclube` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  PRIMARY KEY (`IDclube`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clube`
--

LOCK TABLES `clube` WRITE;
/*!40000 ALTER TABLE `clube` DISABLE KEYS */;
/*!40000 ALTER TABLE `clube` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clube_esportes`
--

DROP TABLE IF EXISTS `clube_esportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clube_esportes` (
  `IDclube` int NOT NULL,
  `nome_esporte` varchar(255) NOT NULL,
  PRIMARY KEY (`IDclube`,`nome_esporte`),
  KEY `nome_esporte` (`nome_esporte`),
  CONSTRAINT `clube_esportes_ibfk_1` FOREIGN KEY (`IDclube`) REFERENCES `clube` (`IDclube`) ON DELETE CASCADE,
  CONSTRAINT `clube_esportes_ibfk_2` FOREIGN KEY (`nome_esporte`) REFERENCES `esporte` (`nome`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clube_esportes`
--

LOCK TABLES `clube_esportes` WRITE;
/*!40000 ALTER TABLE `clube_esportes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clube_esportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentario`
--

DROP TABLE IF EXISTS `comentario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentario` (
  `IDcomentario` int NOT NULL AUTO_INCREMENT,
  `conteudo` text,
  `horario` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `autor_CPF` varchar(14) NOT NULL,
  `IDpublicacao` int NOT NULL,
  PRIMARY KEY (`IDcomentario`),
  KEY `autor_CPF` (`autor_CPF`),
  KEY `IDpublicacao` (`IDpublicacao`),
  CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`autor_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE,
  CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`IDpublicacao`) REFERENCES `publicacao` (`IDpublicacao`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentario`
--

LOCK TABLES `comentario` WRITE;
/*!40000 ALTER TABLE `comentario` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conquista`
--

DROP TABLE IF EXISTS `conquista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conquista` (
  `IDconquista` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `data_conquista` date DEFAULT NULL,
  `conquistado_por` varchar(14) DEFAULT NULL,
  PRIMARY KEY (`IDconquista`),
  KEY `conquistado_por` (`conquistado_por`),
  CONSTRAINT `conquista_ibfk_1` FOREIGN KEY (`conquistado_por`) REFERENCES `atleta` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conquista`
--

LOCK TABLES `conquista` WRITE;
/*!40000 ALTER TABLE `conquista` DISABLE KEYS */;
/*!40000 ALTER TABLE `conquista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curtida`
--

DROP TABLE IF EXISTS `curtida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curtida` (
  `idCurtida` int NOT NULL AUTO_INCREMENT,
  `publicacao_ID` int NOT NULL,
  `usuario_CPF` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`idCurtida`),
  KEY `publicacao_ID` (`publicacao_ID`),
  KEY `usuario_CPF` (`usuario_CPF`),
  CONSTRAINT `curtida_ibfk_1` FOREIGN KEY (`publicacao_ID`) REFERENCES `publicacao` (`IDpublicacao`) ON DELETE CASCADE,
  CONSTRAINT `curtida_ibfk_2` FOREIGN KEY (`usuario_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curtida`
--

LOCK TABLES `curtida` WRITE;
/*!40000 ALTER TABLE `curtida` DISABLE KEYS */;
/*!40000 ALTER TABLE `curtida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denuncia`
--

DROP TABLE IF EXISTS `denuncia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denuncia` (
  `IDdenuncia` int NOT NULL AUTO_INCREMENT,
  `data_denuncia` date DEFAULT NULL,
  `conteudo` text,
  `denunciante_CPF` varchar(14) DEFAULT NULL,
  `denunciado_CPF` varchar(14) DEFAULT NULL,
  PRIMARY KEY (`IDdenuncia`),
  KEY `denunciante_CPF` (`denunciante_CPF`),
  KEY `denunciado_CPF` (`denunciado_CPF`),
  CONSTRAINT `denuncia_ibfk_1` FOREIGN KEY (`denunciante_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE SET NULL,
  CONSTRAINT `denuncia_ibfk_2` FOREIGN KEY (`denunciado_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denuncia`
--

LOCK TABLES `denuncia` WRITE;
/*!40000 ALTER TABLE `denuncia` DISABLE KEYS */;
/*!40000 ALTER TABLE `denuncia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `esporte`
--

DROP TABLE IF EXISTS `esporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `esporte` (
  `nome` varchar(255) NOT NULL,
  `IDesporte` int NOT NULL AUTO_INCREMENT,
  `categoria` enum('Individual','Coletivo') DEFAULT NULL,
  PRIMARY KEY (`nome`),
  UNIQUE KEY `IDesporte` (`IDesporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `esporte`
--

LOCK TABLES `esporte` WRITE;
/*!40000 ALTER TABLE `esporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `esporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento`
--

DROP TABLE IF EXISTS `evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento` (
  `IDevento` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `requisito` text,
  `descricao` text,
  `horario` datetime DEFAULT NULL,
  `data_evento` date DEFAULT NULL,
  PRIMARY KEY (`IDevento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento`
--

LOCK TABLES `evento` WRITE;
/*!40000 ALTER TABLE `evento` DISABLE KEYS */;
/*!40000 ALTER TABLE `evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento_convidados`
--

DROP TABLE IF EXISTS `evento_convidados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento_convidados` (
  `IDevento` int NOT NULL,
  `CPF_convidado` varchar(14) NOT NULL,
  `Convidado` tinyint DEFAULT NULL,
  `Confirmado` tinyint DEFAULT NULL,
  `participou` tinyint DEFAULT NULL,
  PRIMARY KEY (`IDevento`,`CPF_convidado`),
  KEY `CPF_convidado` (`CPF_convidado`),
  CONSTRAINT `evento_convidados_ibfk_1` FOREIGN KEY (`IDevento`) REFERENCES `evento` (`IDevento`) ON DELETE CASCADE,
  CONSTRAINT `evento_convidados_ibfk_2` FOREIGN KEY (`CPF_convidado`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento_convidados`
--

LOCK TABLES `evento_convidados` WRITE;
/*!40000 ALTER TABLE `evento_convidados` DISABLE KEYS */;
/*!40000 ALTER TABLE `evento_convidados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `IDgrupo` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `esporte_grupo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IDgrupo`),
  KEY `esporte_grupo` (`esporte_grupo`),
  CONSTRAINT `grupo_ibfk_1` FOREIGN KEY (`esporte_grupo`) REFERENCES `esporte` (`nome`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_membros`
--

DROP TABLE IF EXISTS `grupo_membros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_membros` (
  `IDgrupo` int NOT NULL,
  `CPF_membro` varchar(14) NOT NULL,
  PRIMARY KEY (`IDgrupo`,`CPF_membro`),
  KEY `CPF_membro` (`CPF_membro`),
  CONSTRAINT `grupo_membros_ibfk_1` FOREIGN KEY (`IDgrupo`) REFERENCES `grupo` (`IDgrupo`) ON DELETE CASCADE,
  CONSTRAINT `grupo_membros_ibfk_2` FOREIGN KEY (`CPF_membro`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_membros`
--

LOCK TABLES `grupo_membros` WRITE;
/*!40000 ALTER TABLE `grupo_membros` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupo_membros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensagem`
--

DROP TABLE IF EXISTS `mensagem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensagem` (
  `IDmensagem` int NOT NULL AUTO_INCREMENT,
  `conteudo` text,
  `horario_data` datetime DEFAULT CURRENT_TIMESTAMP,
  `destinatario_CPF` varchar(14) DEFAULT NULL,
  `grupo_IDgrupo` int DEFAULT NULL,
  `remetente_CPF` varchar(14) NOT NULL,
  PRIMARY KEY (`IDmensagem`),
  KEY `destinatario_CPF` (`destinatario_CPF`),
  KEY `fk_mensagem_grupo1_idx` (`grupo_IDgrupo`),
  KEY `fk_mensagem_usuario1_idx` (`remetente_CPF`),
  CONSTRAINT `fk_mensagem_grupo1` FOREIGN KEY (`grupo_IDgrupo`) REFERENCES `grupo` (`IDgrupo`),
  CONSTRAINT `fk_mensagem_usuario1` FOREIGN KEY (`remetente_CPF`) REFERENCES `usuario` (`CPF`),
  CONSTRAINT `mensagem_ibfk_2` FOREIGN KEY (`destinatario_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensagem`
--

LOCK TABLES `mensagem` WRITE;
/*!40000 ALTER TABLE `mensagem` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensagem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacao`
--

DROP TABLE IF EXISTS `notificacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacao` (
  `IDnotificacao` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `conteudo` text,
  `remetente_CPF` varchar(14) DEFAULT NULL,
  `destinatario_CPF` varchar(14) DEFAULT NULL,
  `horario` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_leitura` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`IDnotificacao`),
  KEY `remetente_CPF` (`remetente_CPF`),
  KEY `destinatario_CPF` (`destinatario_CPF`),
  CONSTRAINT `notificacao_ibfk_1` FOREIGN KEY (`remetente_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE SET NULL,
  CONSTRAINT `notificacao_ibfk_2` FOREIGN KEY (`destinatario_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacao`
--

LOCK TABLES `notificacao` WRITE;
/*!40000 ALTER TABLE `notificacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professor`
--

DROP TABLE IF EXISTS `professor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professor` (
  `CPF` varchar(14) NOT NULL,
  `IDprofessor` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`CPF`),
  UNIQUE KEY `IDprofessor` (`IDprofessor`),
  CONSTRAINT `professor_ibfk_1` FOREIGN KEY (`CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professor`
--

LOCK TABLES `professor` WRITE;
/*!40000 ALTER TABLE `professor` DISABLE KEYS */;
/*!40000 ALTER TABLE `professor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacao`
--

DROP TABLE IF EXISTS `publicacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicacao` (
  `IDpublicacao` int NOT NULL AUTO_INCREMENT,
  `data_publicacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `conteudo` text,
  `autor_CPF` varchar(14) NOT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `esporte` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IDpublicacao`),
  KEY `autor_CPF` (`autor_CPF`),
  CONSTRAINT `publicacao_ibfk_1` FOREIGN KEY (`autor_CPF`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacao`
--

LOCK TABLES `publicacao` WRITE;
/*!40000 ALTER TABLE `publicacao` DISABLE KEYS */;
INSERT INTO `publicacao` VALUES (29,'2025-10-20 00:00:00','sarah ola','666.666.666-66',NULL,NULL),(31,'2025-10-22 00:00:00','ola srah','666.666.666-66',NULL,NULL),(34,'2025-11-05 00:00:00','hhhh','666.666.666-66',NULL,'Caminhada'),(35,'2025-11-05 00:00:00','sdfdfd','666.666.666-66',NULL,NULL),(39,'2025-11-10 00:00:00','Hj foi tuto','107.683.329-23',NULL,'Yoga'),(40,'2025-11-10 00:00:00','jjjd','107.683.329-23',NULL,NULL),(41,'2025-11-10 00:00:00','kklkkk','107.683.329-23',NULL,NULL),(42,'2025-11-10 00:00:00','kkaka','666.666.666-66',NULL,NULL),(43,'2025-11-10 00:00:00','jajja','666.666.666-66','1762797581081.png',NULL),(44,'2025-11-10 20:59:13','hhhhhhhh','666.666.666-66',NULL,NULL);
/*!40000 ALTER TABLE `publicacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguidores`
--

DROP TABLE IF EXISTS `seguidores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguidores` (
  `CPF_seguidor` varchar(14) NOT NULL,
  `CPF_seguido` varchar(14) NOT NULL,
  PRIMARY KEY (`CPF_seguidor`,`CPF_seguido`),
  KEY `CPF_seguido` (`CPF_seguido`),
  CONSTRAINT `seguidores_ibfk_1` FOREIGN KEY (`CPF_seguidor`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE,
  CONSTRAINT `seguidores_ibfk_2` FOREIGN KEY (`CPF_seguido`) REFERENCES `usuario` (`CPF`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguidores`
--

LOCK TABLES `seguidores` WRITE;
/*!40000 ALTER TABLE `seguidores` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguidores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `CPF` varchar(14) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `bio` text,
  `fotoDePerfil` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `nomeUsuario` varchar(100) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CPF`),
  UNIQUE KEY `email` (`email`),
  KEY `localizacaoAtual_id` (`cidade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES ('085.637.499-78','Clara Bianca Kistner','(47) 99953-1753','clarabkistner@gmail.com','clara@','legal as vezes','b22afd23d65d9422ef01b90b1defd3e6','Gaspar','clara',NULL),('107.683.329-23','Daniela Sbizera Justo','(47) 99628-3467','daniela@gmail.com','1234','Bla Bla','1762794782722.png','Blumenau','Dani','1762794835522.jfif'),('127.765.749-16','Sarah','(47) 98862-6995','sarahlinda@gmail.com','1234','bla','1762348974010.png','Blumenal','sarah',NULL),('666.666.666-66','Natan João Vansuita','(88) 88888-8888','vansuita@gmail.com','1234','bla','1761736423042.png',NULL,'nat','1762817361450.jfif');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_esportesdeinteresse`
--

DROP TABLE IF EXISTS `usuario_esportesdeinteresse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_esportesdeinteresse` (
  `CPF_usuario` varchar(14) NOT NULL,
  `nome_esporte` varchar(50) NOT NULL,
  PRIMARY KEY (`CPF_usuario`,`nome_esporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_esportesdeinteresse`
--

LOCK TABLES `usuario_esportesdeinteresse` WRITE;
/*!40000 ALTER TABLE `usuario_esportesdeinteresse` DISABLE KEYS */;
INSERT INTO `usuario_esportesdeinteresse` VALUES ('085.637.499-78','Futebol'),('085.637.499-78','Handebol'),('085.637.499-78','Tennis de Mesa'),('085.637.499-78','Trilha'),('085.637.499-78','Yoga'),('107.683.329-23','Caminhada'),('107.683.329-23','Corrida'),('107.683.329-23','Natação'),('107.683.329-23','Yoga'),('666.666.666-66','Caminhada');
/*!40000 ALTER TABLE `usuario_esportesdeinteresse` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-10 21:24:14
