# RAPPORT TP2 — MongoDB : Plateforme de Gestion de Dossiers Médicaux
## HealthCare DZ — Hôpital Numérique

---

## 1. Justification Embedding vs Referencing

**Consultations → Embedded dans le document patient**

Les consultations sont embarquées directement dans le document patient car elles sont toujours accédées avec le dossier du patient. Un seul accès DB suffit pour récupérer l'historique complet. Le volume reste raisonnable (quelques dizaines de consultations par patient maximum), donc le document ne dépasse pas la limite de 16MB de MongoDB.

**Analyses → Référencées (collection séparée)**

Les analyses sont dans une collection séparée car leur volume peut être très élevé (des centaines de résultats par patient sur plusieurs années) et leurs types de données sont hétérogènes selon le type d'analyse (Glycémie, NFS, ECG...). Le schéma flexible de chaque analyse justifie une collection dédiée avec `patient_id` comme référence.

**Adresse → Embedded (sous-document)**

L'adresse est un sous-document car elle est toujours accédée avec le patient et ne change pas fréquemment. Le modèle `{ wilaya, commune }` est léger et n'impacte pas la taille du document.

**Médecin dans consultation → Embedded**

Les informations du médecin (nom, spécialité) sont dénormalisées dans chaque consultation pour préserver l'historique exact au moment de la visite, même si le médecin change de spécialité ou quitte l'hôpital.

---

## 2. Résultats explain() avant/après indexation

| Métrique | Sans index (COLLSCAN) | Avec index (IXSCAN) |
|----------|----------------------|---------------------|
| nReturned | 3 | 3 |
| totalDocsExamined | 20 | 3 |
| executionTimeMillis | 12ms | 1ms |
| stage | COLLSCAN | IXSCAN |

Sans index, MongoDB examine tous les documents de la collection pour trouver les patients correspondants. Avec l'index composé `{ "adresse.wilaya": 1, antecedents: 1 }`, il accède directement aux documents pertinents. Le gain est proportionnel à la taille de la collection : sur des millions de dossiers, la différence serait de plusieurs secondes contre quelques millisecondes.

---

## 3. Explication du pipeline d'agrégation le plus complexe (3.5)

```javascript
db.patients.aggregate([
  { $unwind: "$consultations" },
  // Étape 1 : On déroule le tableau consultations pour avoir
  // une ligne par consultation. Chaque document patient
  // devient N documents, un par consultation.

  { $group: {
      _id: "$consultations.medecin.nom",
      total_consultations: { $sum: 1 },
      patients_uniques: { $addToSet: "$_id" }
  }},
  // Étape 2 : On groupe par médecin.
  // $sum: 1 compte le nombre total de consultations.
  // $addToSet collecte les _id patients sans doublon
  // pour compter les patients uniques.

  { $addFields: {
      nb_patients_uniques: { $size: "$patients_uniques" },
      taux_reconsultation: { $multiply: [...] }
  }},
  // Étape 3 : On calcule le taux de ré-consultation :
  // (total_consultations - patients_uniques) / patients_uniques × 100
  // Un taux élevé = beaucoup de patients reviennent voir ce médecin.

  { $sort: { total_consultations: -1 } },
  { $limit: 5 }
  // Étape 4 : On trie et on garde les 5 médecins les plus actifs.
])
```

Ce pipeline est efficace car il ne fait qu'un seul passage sur la collection. L'opération la plus coûteuse est `$unwind` qui multiplie les documents, d'où l'importance d'avoir un index sur `consultations.date` pour les filtres temporels en amont.
