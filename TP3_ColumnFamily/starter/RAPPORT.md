# RAPPORT TP3 — Cassandra : Données IoT & Séries Temporelles
## SmartGrid DZ — Surveillance de Réseau Électrique

---

## 1. Justification des Partition Keys

**Table `mesures_par_capteur` → Partition Key : `(capteur_id, date_jour)`**

On utilise une clé composite pour deux raisons. D'abord, `capteur_id` seul crée une partition qui grossit indéfiniment : un capteur qui envoie une mesure par minute génère 525 600 lignes par an dans une seule partition, ce qui surcharge un nœud unique (hot partition). En ajoutant `date_jour` comme bucket, chaque partition représente au maximum 1440 lignes (une par minute sur 24h), ce qui est optimal. La requête cible `"mesures du capteur X entre T1 et T2"` fonctionne sur un seul jour en accès direct, ou sur plusieurs jours avec des requêtes parallèles par bucket.

**Table `alertes_par_wilaya` → Partition Key : `(wilaya, date_jour)`**

Toutes les alertes d'une wilaya pour un jour donné sont colocalisées sur le même nœud. La requête `"alertes d'Alger aujourd'hui"` est un accès direct sans scan. Le bucket jour évite l'accumulation illimitée dans une partition.

**Table `agregats_horaires` → Partition Key : `wilaya`**

Les agrégats sont pré-calculés et peu nombreux (24 lignes par jour par wilaya). Une partition par wilaya est suffisante et permet de récupérer tout le dashboard d'une wilaya en un seul accès.

---

## 2. Pourquoi ALLOW FILTERING est dangereux en production

`ALLOW FILTERING` force Cassandra à scanner toutes les partitions de la table pour trouver les lignes correspondant au filtre. Dans un cluster distribué, cela signifie :

- Lecture sur tous les nœuds du cluster en parallèle
- Transfert de données massif entre nœuds
- Latence qui augmente linéairement avec le volume de données
- Risque de timeout sur les grandes tables

Sur une table de 10 millions de lignes réparties sur 10 nœuds, une requête avec `ALLOW FILTERING` peut prendre plusieurs secondes là où un accès par clé de partition prend moins d'une milliseconde. En production avec 10 000 capteurs, cela rendrait le système inutilisable.

La bonne pratique est de créer une table dédiée pour chaque requête fréquente, ce qui est l'essence du principe "model your queries" de Cassandra.

---

## 3. Comparaison TWCS vs STCS vs LCS

| Stratégie | Cas d'usage | Avantages | Inconvénients |
|-----------|-------------|-----------|---------------|
| **TWCS** (TimeWindowCompactionStrategy) | Séries temporelles avec TTL | Compacte par fenêtre temporelle, suppression rapide des données expirées, faible amplification d'écriture | Inefficace si les données ne sont pas insérées en ordre chronologique |
| **STCS** (SizeTieredCompactionStrategy) | Workload écriture intensive, données sans TTL | Bonne performance en écriture, simple | Amplification de lecture, espace disque temporairement doublé pendant la compaction |
| **LCS** (LeveledCompactionStrategy) | Workload lecture intensive | Lectures rapides, chevauchement minimal des SSTables | Amplification d'écriture élevée, consommation CPU plus forte |

**Choix pour SmartGrid :** TWCS est le choix naturel car les mesures IoT sont insérées en ordre chronologique, ont un TTL défini (90 jours pour les mesures brutes), et la suppression des données expirées doit être efficace pour maîtriser l'espace disque.
