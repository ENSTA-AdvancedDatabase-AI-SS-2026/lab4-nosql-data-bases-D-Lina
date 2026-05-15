/**
 * TP2 - Exercice 1 : Modélisation MongoDB
 * Use Case : HealthCare DZ - Dossiers Médicaux
 */
use("medical_db");

// ─── 1.1 : Créer la collection avec validation ────────────────────────────────
db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cin", "nom", "prenom", "dateNaissance", "sexe"],
      properties: {
        cin: { bsonType: "string", description: "CIN obligatoire" },
        nom: { bsonType: "string", description: "Nom de famille obligatoire" },
        prenom: { bsonType: "string", description: "Prénom obligatoire" },
        dateNaissance: { bsonType: "date", description: "Date de naissance obligatoire" },
        sexe: { enum: ["M", "F"], description: "Sexe doit être M ou F" },
        groupeSanguin: { bsonType: "string" },
        antecedents: { bsonType: "array", items: { bsonType: "string" } },
        allergies: { bsonType: "array", items: { bsonType: "string" } },
        adresse: {
          bsonType: "object",
          properties: {
            wilaya: { bsonType: "string" },
            commune: { bsonType: "string" }
          }
        },
        consultations: { bsonType: "array" },
        analyses: { bsonType: "array" }
      }
    }
  }
});

// ─── 1.2 : Insérer des patients avec données algériennes ──────────────────────
const patients = [
  {
    cin: "198001012300",
    nom: "Bensalem",
    prenom: "Ahmed",
    dateNaissance: new Date("1980-01-01"),
    sexe: "M",
    adresse: { wilaya: "Alger", commune: "Bab Ezzouar" },
    groupeSanguin: "O+",
    antecedents: ["Diabète type 2", "HTA"],
    allergies: ["Pénicilline"],
    consultations: [
      {
        date: new Date("2024-01-15"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Hypertension artérielle",
        tension: { systolique: 145, diastolique: 92 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Surveillance tensionnelle recommandée"
      },
      {
        date: new Date("2024-04-10"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Diabète type 2 - contrôle",
        tension: { systolique: 138, diastolique: 88 },
        medicaments: [{ nom: "Metformine", dosage: "1000mg", duree: "90 jours" }],
        notes: "Glycémie à surveiller"
      },
      {
        date: new Date("2024-08-20"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Contrôle diabète",
        tension: { systolique: 130, diastolique: 85 },
        medicaments: [{ nom: "Insuline Glargine", dosage: "10UI", duree: "30 jours" }],
        notes: "Passage à l'insuline recommandé"
      }
    ]
  },
  {
    cin: "199205153400",
    nom: "Boudiaf",
    prenom: "Fatima",
    dateNaissance: new Date("1992-05-15"),
    sexe: "F",
    adresse: { wilaya: "Oran", commune: "Es Senia" },
    groupeSanguin: "A+",
    antecedents: ["Asthme"],
    allergies: ["Aspirine"],
    consultations: [
      {
        date: new Date("2023-11-05"),
        medecin: { nom: "Dr. Belaidi", specialite: "Pneumologie" },
        diagnostic: "Asthme bronchique",
        tension: { systolique: 120, diastolique: 78 },
        medicaments: [{ nom: "Salbutamol", dosage: "100mcg", duree: "À la demande" }],
        notes: "Éviter les allergènes"
      },
      {
        date: new Date("2024-02-18"),
        medecin: { nom: "Dr. Belaidi", specialite: "Pneumologie" },
        diagnostic: "Crise d'asthme légère",
        tension: { systolique: 118, diastolique: 75 },
        medicaments: [
          { nom: "Salbutamol", dosage: "100mcg", duree: "7 jours" },
          { nom: "Prednisolone", dosage: "20mg", duree: "5 jours" }
        ],
        notes: "Crise déclenchée par exposition à la poussière"
      }
    ]
  },
  {
    cin: "197503284500",
    nom: "Merad",
    prenom: "Karim",
    dateNaissance: new Date("1975-03-28"),
    sexe: "M",
    adresse: { wilaya: "Constantine", commune: "Ain Smara" },
    groupeSanguin: "B+",
    antecedents: ["HTA", "Hypercholestérolémie"],
    allergies: [],
    consultations: [
      {
        date: new Date("2023-09-12"),
        medecin: { nom: "Dr. Saadi", specialite: "Cardiologie" },
        diagnostic: "Hypertension artérielle sévère",
        tension: { systolique: 165, diastolique: 100 },
        medicaments: [
          { nom: "Ramipril", dosage: "10mg", duree: "30 jours" },
          { nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }
        ],
        notes: "Régime hyposodé strict recommandé"
      },
      {
        date: new Date("2024-01-22"),
        medecin: { nom: "Dr. Saadi", specialite: "Cardiologie" },
        diagnostic: "Contrôle HTA",
        tension: { systolique: 148, diastolique: 94 },
        medicaments: [{ nom: "Ramipril", dosage: "10mg", duree: "90 jours" }],
        notes: "Légère amélioration"
      },
      {
        date: new Date("2024-06-15"),
        medecin: { nom: "Dr. Saadi", specialite: "Cardiologie" },
        diagnostic: "HTA stabilisée",
        tension: { systolique: 135, diastolique: 88 },
        medicaments: [{ nom: "Amlodipine", dosage: "10mg", duree: "90 jours" }],
        notes: "Bonne observance thérapeutique"
      }
    ]
  },
  {
    cin: "196812091200",
    nom: "Zerrouki",
    prenom: "Malika",
    dateNaissance: new Date("1968-12-09"),
    sexe: "F",
    adresse: { wilaya: "Annaba", commune: "El Bouni" },
    groupeSanguin: "AB+",
    antecedents: ["Diabète type 2", "Insuffisance rénale chronique"],
    allergies: ["Pénicilline", "Sulfamides"],
    consultations: [
      {
        date: new Date("2023-10-03"),
        medecin: { nom: "Dr. Hamdi", specialite: "Néphrologie" },
        diagnostic: "Insuffisance rénale stade 3",
        tension: { systolique: 150, diastolique: 95 },
        medicaments: [{ nom: "Furosémide", dosage: "40mg", duree: "30 jours" }],
        notes: "Restriction hydrique et régime pauvre en potassium"
      },
      {
        date: new Date("2024-03-14"),
        medecin: { nom: "Dr. Hamdi", specialite: "Néphrologie" },
        diagnostic: "Contrôle IRC",
        tension: { systolique: 142, diastolique: 90 },
        medicaments: [{ nom: "Furosémide", dosage: "40mg", duree: "60 jours" }],
        notes: "Créatinine stable"
      }
    ]
  },
  {
    cin: "199807224600",
    nom: "Tlemcani",
    prenom: "Youssef",
    dateNaissance: new Date("1998-07-22"),
    sexe: "M",
    adresse: { wilaya: "Tlemcen", commune: "Mansourah" },
    groupeSanguin: "O-",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        date: new Date("2024-05-10"),
        medecin: { nom: "Dr. Benali", specialite: "Médecine générale" },
        diagnostic: "Grippe saisonnière",
        tension: { systolique: 118, diastolique: 76 },
        medicaments: [
          { nom: "Paracétamol", dosage: "1g", duree: "5 jours" },
          { nom: "Ibuprofène", dosage: "400mg", duree: "3 jours" }
        ],
        notes: "Repos et hydratation recommandés"
      }
    ]
  },
  {
    cin: "198506176700",
    nom: "Boukerche",
    prenom: "Amina",
    dateNaissance: new Date("1985-06-17"),
    sexe: "F",
    adresse: { wilaya: "Blida", commune: "Boufarik" },
    groupeSanguin: "A-",
    antecedents: ["Hypothyroïdie"],
    allergies: [],
    consultations: [
      {
        date: new Date("2023-12-01"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Hypothyroïdie",
        tension: { systolique: 115, diastolique: 72 },
        medicaments: [{ nom: "Lévothyroxine", dosage: "75mcg", duree: "90 jours" }],
        notes: "TSH à contrôler dans 3 mois"
      },
      {
        date: new Date("2024-03-05"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Contrôle hypothyroïdie",
        tension: { systolique: 112, diastolique: 70 },
        medicaments: [{ nom: "Lévothyroxine", dosage: "100mcg", duree: "90 jours" }],
        notes: "Dosage augmenté"
      }
    ]
  },
  {
    cin: "197209308900",
    nom: "Hadj Ali",
    prenom: "Omar",
    dateNaissance: new Date("1972-09-30"),
    sexe: "M",
    adresse: { wilaya: "Sétif", commune: "El Eulma" },
    groupeSanguin: "B-",
    antecedents: ["Diabète type 2", "HTA", "Rétinopathie diabétique"],
    allergies: ["Pénicilline"],
    consultations: [
      {
        date: new Date("2023-08-20"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA mal contrôlée",
        tension: { systolique: 170, diastolique: 105 },
        medicaments: [
          { nom: "Losartan", dosage: "100mg", duree: "30 jours" },
          { nom: "Hydrochlorothiazide", dosage: "25mg", duree: "30 jours" }
        ],
        notes: "Urgence tensionnelle évitée de justesse"
      },
      {
        date: new Date("2024-01-08"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Contrôle HTA + Diabète",
        tension: { systolique: 155, diastolique: 98 },
        medicaments: [{ nom: "Losartan", dosage: "100mg", duree: "90 jours" }],
        notes: "Contrôle ophtalmologique recommandé"
      },
      {
        date: new Date("2024-07-15"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Diabète déséquilibré",
        tension: { systolique: 148, diastolique: 92 },
        medicaments: [{ nom: "Insuline NPH", dosage: "20UI", duree: "30 jours" }],
        notes: "HbA1c à 9.5%"
      }
    ]
  },
  {
    cin: "199001254100",
    nom: "Ferrahi",
    prenom: "Leila",
    dateNaissance: new Date("1990-01-25"),
    sexe: "F",
    adresse: { wilaya: "Alger", commune: "Kouba" },
    groupeSanguin: "O+",
    antecedents: [],
    allergies: ["Ibuprofène"],
    consultations: [
      {
        date: new Date("2024-02-14"),
        medecin: { nom: "Dr. Benali", specialite: "Médecine générale" },
        diagnostic: "Angine bactérienne",
        tension: { systolique: 122, diastolique: 80 },
        medicaments: [{ nom: "Amoxicilline", dosage: "1g", duree: "7 jours" }],
        notes: "Éviter ibuprofène"
      },
      {
        date: new Date("2024-09-01"),
        medecin: { nom: "Dr. Benali", specialite: "Médecine générale" },
        diagnostic: "Rhinite allergique",
        tension: { systolique: 118, diastolique: 76 },
        medicaments: [{ nom: "Cétirizine", dosage: "10mg", duree: "15 jours" }],
        notes: "Allergie saisonnière"
      }
    ]
  },
  {
    cin: "196504197800",
    nom: "Bouzid",
    prenom: "Rachid",
    dateNaissance: new Date("1965-04-19"),
    sexe: "M",
    adresse: { wilaya: "Oran", commune: "Bir El Djir" },
    groupeSanguin: "AB-",
    antecedents: ["BPCO", "Tabagisme"],
    allergies: [],
    consultations: [
      {
        date: new Date("2023-10-25"),
        medecin: { nom: "Dr. Belaidi", specialite: "Pneumologie" },
        diagnostic: "BPCO stade 2",
        tension: { systolique: 132, diastolique: 84 },
        medicaments: [
          { nom: "Tiotropium", dosage: "18mcg", duree: "90 jours" },
          { nom: "Formotérol", dosage: "12mcg", duree: "90 jours" }
        ],
        notes: "Arrêt tabac impératif"
      },
      {
        date: new Date("2024-04-07"),
        medecin: { nom: "Dr. Belaidi", specialite: "Pneumologie" },
        diagnostic: "Exacerbation BPCO",
        tension: { systolique: 138, diastolique: 86 },
        medicaments: [
          { nom: "Prednisolone", dosage: "40mg", duree: "7 jours" },
          { nom: "Amoxicilline-Clavulanate", dosage: "1g", duree: "7 jours" }
        ],
        notes: "Hospitalisation envisagée si pas d'amélioration"
      }
    ]
  },
  {
    cin: "200103056300",
    nom: "Hadjadj",
    prenom: "Rania",
    dateNaissance: new Date("2001-03-05"),
    sexe: "F",
    adresse: { wilaya: "Constantine", commune: "Hamma Bouziane" },
    groupeSanguin: "A+",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        date: new Date("2024-06-20"),
        medecin: { nom: "Dr. Saadi", specialite: "Cardiologie" },
        diagnostic: "Palpitations - bilan normal",
        tension: { systolique: 110, diastolique: 68 },
        medicaments: [],
        notes: "ECG normal, stress évoqué"
      }
    ]
  },
  {
    cin: "197811143500",
    nom: "Messaoudi",
    prenom: "Sofiane",
    dateNaissance: new Date("1978-11-14"),
    sexe: "M",
    adresse: { wilaya: "Blida", commune: "Meftah" },
    groupeSanguin: "O+",
    antecedents: ["HTA"],
    allergies: [],
    consultations: [
      {
        date: new Date("2023-07-18"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA stade 1",
        tension: { systolique: 142, diastolique: 91 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Activité physique recommandée"
      },
      {
        date: new Date("2024-01-30"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA contrôlée",
        tension: { systolique: 132, diastolique: 84 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "90 jours" }],
        notes: "Bonne évolution"
      }
    ]
  },
  {
    cin: "198903227100",
    nom: "Chaouch",
    prenom: "Nawal",
    dateNaissance: new Date("1989-03-22"),
    sexe: "F",
    adresse: { wilaya: "Annaba", commune: "Sidi Amar" },
    groupeSanguin: "B+",
    antecedents: ["Anémie ferriprive"],
    allergies: [],
    consultations: [
      {
        date: new Date("2024-03-10"),
        medecin: { nom: "Dr. Hamdi", specialite: "Hématologie" },
        diagnostic: "Anémie ferriprive",
        tension: { systolique: 108, diastolique: 65 },
        medicaments: [{ nom: "Fer sulfate", dosage: "80mg", duree: "60 jours" }],
        notes: "NFS à refaire dans 2 mois"
      },
      {
        date: new Date("2024-05-20"),
        medecin: { nom: "Dr. Hamdi", specialite: "Hématologie" },
        diagnostic: "Contrôle anémie",
        tension: { systolique: 112, diastolique: 70 },
        medicaments: [{ nom: "Fer sulfate", dosage: "80mg", duree: "30 jours" }],
        notes: "Hémoglobine en hausse"
      }
    ]
  },
  {
    cin: "197006085200",
    nom: "Kebir",
    prenom: "Mourad",
    dateNaissance: new Date("1970-06-08"),
    sexe: "M",
    adresse: { wilaya: "Sétif", commune: "Bougaa" },
    groupeSanguin: "A+",
    antecedents: ["Diabète type 2", "HTA", "Obésité"],
    allergies: ["Sulfamides"],
    consultations: [
      {
        date: new Date("2023-09-05"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Diabète mal équilibré",
        tension: { systolique: 158, diastolique: 99 },
        medicaments: [
          { nom: "Metformine", dosage: "1000mg", duree: "90 jours" },
          { nom: "Gliclazide", dosage: "60mg", duree: "90 jours" }
        ],
        notes: "Régime alimentaire strict"
      },
      {
        date: new Date("2024-02-22"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Contrôle diabète + HTA",
        tension: { systolique: 145, diastolique: 92 },
        medicaments: [{ nom: "Metformine", dosage: "2000mg", duree: "90 jours" }],
        notes: "HbA1c à 8.2%"
      },
      {
        date: new Date("2024-07-11"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Diabète + obésité",
        tension: { systolique: 140, diastolique: 88 },
        medicaments: [{ nom: "Insuline Glargine", dosage: "15UI", duree: "30 jours" }],
        notes: "IMC à 34"
      }
    ]
  },
  {
    cin: "199511299000",
    nom: "Lounis",
    prenom: "Yasmine",
    dateNaissance: new Date("1995-11-29"),
    sexe: "F",
    adresse: { wilaya: "Tizi Ouzou", commune: "Azazga" },
    groupeSanguin: "O+",
    antecedents: [],
    allergies: ["Pénicilline"],
    consultations: [
      {
        date: new Date("2024-04-15"),
        medecin: { nom: "Dr. Benali", specialite: "Médecine générale" },
        diagnostic: "Infection urinaire",
        tension: { systolique: 116, diastolique: 74 },
        medicaments: [{ nom: "Ciprofloxacine", dosage: "500mg", duree: "7 jours" }],
        notes: "Allergie pénicilline documentée"
      }
    ]
  },
  {
    cin: "196201168000",
    nom: "Djoudi",
    prenom: "Hocine",
    dateNaissance: new Date("1962-01-16"),
    sexe: "M",
    adresse: { wilaya: "Alger", commune: "Hussein Dey" },
    groupeSanguin: "B+",
    antecedents: ["Cardiopathie ischémique", "Diabète type 2", "HTA"],
    allergies: [],
    consultations: [
      {
        date: new Date("2023-11-18"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Angor stable",
        tension: { systolique: 152, diastolique: 96 },
        medicaments: [
          { nom: "Aspirine", dosage: "100mg", duree: "À vie" },
          { nom: "Atorvastatine", dosage: "40mg", duree: "À vie" },
          { nom: "Bisoprolol", dosage: "5mg", duree: "30 jours" }
        ],
        notes: "Coronarographie à envisager"
      },
      {
        date: new Date("2024-03-25"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Suivi cardiopathie",
        tension: { systolique: 144, diastolique: 90 },
        medicaments: [{ nom: "Bisoprolol", dosage: "5mg", duree: "90 jours" }],
        notes: "Écho cardiaque programmé"
      },
      {
        date: new Date("2024-08-05"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Contrôle cardiopathie",
        tension: { systolique: 138, diastolique: 86 },
        medicaments: [{ nom: "Ramipril", dosage: "5mg", duree: "90 jours" }],
        notes: "FE à 50%"
      }
    ]
  },
  {
    cin: "198708203800",
    nom: "Belmahi",
    prenom: "Sara",
    dateNaissance: new Date("1987-08-20"),
    sexe: "F",
    adresse: { wilaya: "Oran", commune: "Arzew" },
    groupeSanguin: "A+",
    antecedents: ["Lupus érythémateux systémique"],
    allergies: ["AINS"],
    consultations: [
      {
        date: new Date("2024-01-09"),
        medecin: { nom: "Dr. Belaidi", specialite: "Rhumatologie" },
        diagnostic: "Poussée lupique",
        tension: { systolique: 126, diastolique: 82 },
        medicaments: [
          { nom: "Hydroxychloroquine", dosage: "400mg", duree: "90 jours" },
          { nom: "Prednisolone", dosage: "30mg", duree: "14 jours" }
        ],
        notes: "Bilan immunologique complet"
      },
      {
        date: new Date("2024-06-12"),
        medecin: { nom: "Dr. Belaidi", specialite: "Rhumatologie" },
        diagnostic: "Lupus en rémission",
        tension: { systolique: 120, diastolique: 78 },
        medicaments: [{ nom: "Hydroxychloroquine", dosage: "200mg", duree: "90 jours" }],
        notes: "Rémission partielle"
      }
    ]
  },
  {
    cin: "197404126100",
    nom: "Amrani",
    prenom: "Khaled",
    dateNaissance: new Date("1974-04-12"),
    sexe: "M",
    adresse: { wilaya: "Béjaïa", commune: "Akbou" },
    groupeSanguin: "O-",
    antecedents: ["Épilepsie"],
    allergies: [],
    consultations: [
      {
        date: new Date("2023-12-20"),
        medecin: { nom: "Dr. Saadi", specialite: "Neurologie" },
        diagnostic: "Épilepsie focale",
        tension: { systolique: 128, diastolique: 82 },
        medicaments: [{ nom: "Valproate de sodium", dosage: "500mg", duree: "90 jours" }],
        notes: "Pas de crise depuis 6 mois"
      },
      {
        date: new Date("2024-05-30"),
        medecin: { nom: "Dr. Saadi", specialite: "Neurologie" },
        diagnostic: "Contrôle épilepsie",
        tension: { systolique: 124, diastolique: 80 },
        medicaments: [{ nom: "Valproate de sodium", dosage: "500mg", duree: "90 jours" }],
        notes: "EEG stable"
      }
    ]
  },
  {
    cin: "199309107200",
    nom: "Larbi",
    prenom: "Imene",
    dateNaissance: new Date("1993-09-10"),
    sexe: "F",
    adresse: { wilaya: "Alger", commune: "Dar El Beida" },
    groupeSanguin: "AB+",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        date: new Date("2024-07-22"),
        medecin: { nom: "Dr. Benali", specialite: "Médecine générale" },
        diagnostic: "Gastro-entérite aiguë",
        tension: { systolique: 114, diastolique: 72 },
        medicaments: [
          { nom: "Métoclopramide", dosage: "10mg", duree: "5 jours" },
          { nom: "Smecta", dosage: "3g", duree: "5 jours" }
        ],
        notes: "Réhydratation orale"
      }
    ]
  },
  {
    cin: "196908225500",
    nom: "Ouali",
    prenom: "Hamid",
    dateNaissance: new Date("1969-08-22"),
    sexe: "M",
    adresse: { wilaya: "Mascara", commune: "Sig" },
    groupeSanguin: "A-",
    antecedents: ["Diabète type 2", "Neuropathie diabétique"],
    allergies: ["Pénicilline"],
    consultations: [
      {
        date: new Date("2023-10-14"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Neuropathie diabétique douloureuse",
        tension: { systolique: 136, diastolique: 86 },
        medicaments: [
          { nom: "Prégabaline", dosage: "75mg", duree: "30 jours" },
          { nom: "Metformine", dosage: "1000mg", duree: "90 jours" }
        ],
        notes: "Douleurs neuropathiques aux membres inférieurs"
      },
      {
        date: new Date("2024-02-05"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Contrôle neuropathie",
        tension: { systolique: 130, diastolique: 82 },
        medicaments: [{ nom: "Prégabaline", dosage: "150mg", duree: "60 jours" }],
        notes: "Légère amélioration de la douleur"
      },
      {
        date: new Date("2024-08-18"),
        medecin: { nom: "Dr. Khelif", specialite: "Endocrinologie" },
        diagnostic: "Diabète + complications",
        tension: { systolique: 134, diastolique: 84 },
        medicaments: [{ nom: "Insuline Glargine", dosage: "12UI", duree: "30 jours" }],
        notes: "HbA1c à 8.8%"
      }
    ]
  },
  {
    cin: "200006149300",
    nom: "Benhamida",
    prenom: "Adam",
    dateNaissance: new Date("2000-06-14"),
    sexe: "M",
    adresse: { wilaya: "Alger", commune: "Birkhadem" },
    groupeSanguin: "B+",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        date: new Date("2024-08-10"),
        medecin: { nom: "Dr. Benali", specialite: "Médecine générale" },
        diagnostic: "Lombalgie aiguë",
        tension: { systolique: 120, diastolique: 78 },
        medicaments: [
          { nom: "Ibuprofène", dosage: "400mg", duree: "7 jours" },
          { nom: "Myorelaxant", dosage: "4mg", duree: "5 jours" }
        ],
        notes: "Repos relatif, kinésithérapie recommandée"
      }
    ]
  }
];

db.patients.insertMany(patients);

// ─── 1.3 : Collection analyses (référencée) ───────────────────────────────────
const patientIds = db.patients.find({}, { _id: 1, cin: 1 }).toArray();
const getPatientId = (cin) => patientIds.find(p => p.cin === cin)?._id;

const analyses = [
  {
    patient_id: getPatientId("198001012300"),
    date: new Date("2024-01-10"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.42, unite: "g/L", valeur_normale: "0.70-1.10" },
    laboratoire: "Labo Central Alger",
    valide: true
  },
  {
    patient_id: getPatientId("198001012300"),
    date: new Date("2024-04-08"),
    type: "Lipidogramme",
    resultats: { cholesterol_total: 2.1, LDL: 1.4, HDL: 0.45, triglycerides: 1.8, unite: "g/L" },
    laboratoire: "Labo Central Alger",
    valide: true
  },
  {
    patient_id: getPatientId("197503284500"),
    date: new Date("2024-01-20"),
    type: "NFS",
    resultats: { hemoglobine: 14.2, globules_blancs: 7200, plaquettes: 210000 },
    laboratoire: "Labo Constantine",
    valide: true
  },
  {
    patient_id: getPatientId("197503284500"),
    date: new Date("2024-01-20"),
    type: "Lipidogramme",
    resultats: { cholesterol_total: 2.8, LDL: 1.9, HDL: 0.38, triglycerides: 2.4, unite: "g/L" },
    laboratoire: "Labo Constantine",
    valide: true
  },
  {
    patient_id: getPatientId("196812091200"),
    date: new Date("2024-03-12"),
    type: "Créatinine",
    resultats: { creatinine: 185, DFG: 32, unite: "µmol/L", valeur_normale: "60-110" },
    laboratoire: "Labo Annaba",
    valide: true
  },
  {
    patient_id: getPatientId("197209308900"),
    date: new Date("2024-01-06"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.85, unite: "g/L", valeur_normale: "0.70-1.10" },
    laboratoire: "Labo Sétif",
    valide: true
  },
  {
    patient_id: getPatientId("197209308900"),
    date: new Date("2024-07-12"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 2.10, unite: "g/L", valeur_normale: "0.70-1.10" },
    laboratoire: "Labo Sétif",
    valide: true
  },
  {
    patient_id: getPatientId("197006085200"),
    date: new Date("2024-02-20"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.68, unite: "g/L", valeur_normale: "0.70-1.10" },
    laboratoire: "Labo Sétif",
    valide: true
  },
  {
    patient_id: getPatientId("196201168000"),
    date: new Date("2024-03-23"),
    type: "ECG",
    resultats: { rythme: "Sinusal", frequence: 72, anomalies: "Séquelles d'infarctus antérieur" },
    laboratoire: "Cardio Alger",
    valide: true
  },
  {
    patient_id: getPatientId("196201168000"),
    date: new Date("2024-03-23"),
    type: "Lipidogramme",
    resultats: { cholesterol_total: 2.4, LDL: 1.6, HDL: 0.42, triglycerides: 1.6, unite: "g/L" },
    laboratoire: "Labo Central Alger",
    valide: true
  },
  {
    patient_id: getPatientId("198903227100"),
    date: new Date("2024-03-08"),
    type: "NFS",
    resultats: { hemoglobine: 9.2, globules_blancs: 6800, plaquettes: 185000, ferritine: 8 },
    laboratoire: "Labo Annaba",
    valide: true
  },
  {
    patient_id: getPatientId("198903227100"),
    date: new Date("2024-05-18"),
    type: "NFS",
    resultats: { hemoglobine: 10.8, globules_blancs: 7100, plaquettes: 192000, ferritine: 22 },
    laboratoire: "Labo Annaba",
    valide: true
  },
  {
    patient_id: getPatientId("196908225500"),
    date: new Date("2024-02-03"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.72, unite: "g/L", valeur_normale: "0.70-1.10" },
    laboratoire: "Labo Mascara",
    valide: true
  },
  {
    patient_id: getPatientId("196908225500"),
    date: new Date("2024-08-15"),
    type: "Créatinine",
    resultats: { creatinine: 105, DFG: 68, unite: "µmol/L", valeur_normale: "60-110" },
    laboratoire: "Labo Mascara",
    valide: true
  }
];

db.analyses.insertMany(analyses);

print("✅ Modélisation terminée. Patients insérés:", db.patients.countDocuments());
print("✅ Analyses insérées:", db.analyses.countDocuments());
