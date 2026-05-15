# RAPPORT TP4 — Neo4j : Réseau Social Universitaire
## UniConnect DZ — Plateforme Étudiante

---

## 1. Schéma du Graphe
(:Etudiant {id, prenom, nom, universite, filiere, annee, ville})
│
├─[:CONNAIT {depuis, contexte}]──► (:Etudiant)
│
├─[:SUIT {semestre, note}]─────► (:Cours {code, intitule, credits, departement})
│
├─[:MEMBRE_DE {role}]──────────► (:Club {nom, universite, domaine})
│
├─[:A_STAGE_CHEZ {annee, duree_mois}]──► (:Entreprise {nom, secteur, ville})
│
└─[:MAITRISE {niveau}]─────────► (:Competence {nom, categorie})
(:Cours)-[:REQUIERT]──► (:Competence)
Le graphe contient 50 étudiants, 5 cours, 5 clubs, 5 entreprises et 10 compétences, reliés par plus de 150 relations.

---

## 2. Résultats de la détection de communautés (Louvain)

L'algorithme de Louvain a détecté des communautés qui correspondent globalement aux universités d'appartenance des étudiants, avec quelques chevauchements dus aux relations inter-universités créées dans le graphe.

| Communauté | Taille | Caractéristique principale |
|------------|--------|---------------------------|
| Communauté 1 | ~12 | Étudiants USTHB — Alger |
| Communauté 2 | ~10 | Étudiants UMBB — Boumerdes |
| Communauté 3 | ~10 | Étudiants USTO — Oran |
| Communauté 4 | ~9 | Étudiants UMC — Constantine |
| Communauté 5 | ~9 | Étudiants UBMA — Annaba |

Les étudiants qui appartiennent à plusieurs communautés (scores de modularité faibles) sont ceux qui ont des relations CONNAIT inter-universités, ce qui correspond aux étudiants qui ont participé à des événements nationaux ou partagent un club inter-universités.

---

## 3. Comparaison SQL vs Cypher

**Requête : Trouver les amis d'amis d'Ahmed qui ne le connaissent pas déjà**

**SQL :**
```sql
SELECT DISTINCT u3.prenom
FROM utilisateurs u1
JOIN amities a1 ON u1.id = a1.user_id
JOIN utilisateurs u2 ON a1.ami_id = u2.id
JOIN amities a2 ON u2.id = a2.user_id
JOIN utilisateurs u3 ON a2.ami_id = u3.id
WHERE u1.prenom = 'Ahmed'
  AND u3.id != u1.id
  AND u3.id NOT IN (
    SELECT ami_id FROM amities WHERE user_id = u1.id
  )
LIMIT 10;
```

**Cypher :**
```cypher
MATCH (ahmed:Etudiant {prenom: "Ahmed"})-[:CONNAIT*2]-(suggestion)
WHERE NOT (ahmed)-[:CONNAIT]-(suggestion) AND suggestion <> ahmed
RETURN DISTINCT suggestion.prenom
LIMIT 10;
```

| Critère | SQL | Cypher |
|---------|-----|--------|
| Lignes de code | 12 | 4 |
| Lisibilité | Difficile (3 JOINs imbriqués) | Intuitive |
| Performance (1M users) | Dégradation exponentielle | Stable (index de graphe) |
| Extension à 3 sauts | +1 JOIN supplémentaire | Changer `*2` en `*3` |

Cypher est non seulement plus lisible mais aussi structurellement plus adapté : les bases relationnelles n'ont pas d'index natif pour les traversées de graphe, chaque JOIN supplémentaire multiplie le coût d'exécution.
