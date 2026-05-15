// TP4 - Exercice 3 : Algorithmes de Graphe avec GDS

// ─── 3.1 : Plus court chemin ──────────────────────────────────────────────────
MATCH p = shortestPath(
  (a:Etudiant {prenom: "Ahmed"})-[:CONNAIT*..10]-(b:Etudiant {prenom: "Yasmina"})
)
RETURN [n IN nodes(p) | n.prenom + " (" + n.universite + ")"] AS chemin,
       length(p) AS nb_intermediaires;

// ─── 3.2 : Centralité de degré ────────────────────────────────────────────────
CALL gds.graph.project(
  'reseau_social',
  'Etudiant',
  'CONNAIT'
);

CALL gds.degree.stream('reseau_social')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).prenom AS etudiant,
       gds.util.asNode(nodeId).universite AS universite,
       score AS nb_connexions
ORDER BY score DESC
LIMIT 10;

// ─── 3.3 : Détection de communautés (Louvain) ────────────────────────────────
CALL gds.louvain.stream('reseau_social')
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId).prenom) AS membres,
     collect(gds.util.asNode(nodeId).universite) AS universites
RETURN communityId,
       size(membres) AS taille,
       membres[0..5] AS exemple_membres,
       universites[0..3] AS exemple_universites
ORDER BY taille DESC;

// ─── 3.4 : Recommandation de contacts ────────────────────────────────────────
MATCH (moi:Etudiant {prenom: "Ahmed"})
MATCH (suggestion:Etudiant)
WHERE suggestion <> moi
  AND NOT (moi)-[:CONNAIT]-(suggestion)

OPTIONAL MATCH (moi)-[:CONNAIT]-(:Etudiant)-[:CONNAIT]-(suggestion)
WITH moi, suggestion, count(DISTINCT suggestion) AS nb_amis_communs

OPTIONAL MATCH (moi)-[:SUIT]->(c:Cours)<-[:SUIT]-(suggestion)
WITH moi, suggestion, nb_amis_communs, count(DISTINCT c) AS nb_cours_communs

WITH suggestion,
     nb_amis_communs,
     nb_cours_communs,
     CASE WHEN suggestion.filiere = moi.filiere THEN 1 ELSE 0 END AS meme_filiere,
     (nb_amis_communs * 3 + nb_cours_communs * 2 +
      CASE WHEN suggestion.filiere = moi.filiere THEN 1 ELSE 0 END) AS score
WHERE score > 0
RETURN suggestion.prenom AS suggestion,
       suggestion.universite AS universite,
       suggestion.filiere AS filiere,
       nb_amis_communs,
       nb_cours_communs,
       meme_filiere,
       score
ORDER BY score DESC
LIMIT 5;

// ─── 3.5 : Chemin de compétences ─────────────────────────────────────────────
// Cours qui requièrent directement Machine Learning
MATCH (c:Cours)-[:REQUIERT]->(comp:Competence {nom: "Machine Learning"})
RETURN c.intitule AS cours, comp.nom AS competence_cible;

// Étudiants qui maîtrisent ML et les cours qu'ils ont suivis
// (chemin indirect : étudiant → cours → compétence)
MATCH (e:Etudiant)-[:MAITRISE]->(comp:Competence {nom: "Machine Learning"})
MATCH (e)-[:SUIT]->(c:Cours)
RETURN c.intitule AS cours_utiles,
       count(e) AS nb_etudiants_ML_qui_ont_suivi
ORDER BY nb_etudiants_ML_qui_ont_suivi DESC;

// Nettoyage
CALL gds.graph.drop('reseau_social');
