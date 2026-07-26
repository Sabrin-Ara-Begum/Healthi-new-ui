import express from "express";

const router = express.Router();

// Static lists for searchable items
const PAGES = [
  { title: "Symptom Checker", description: "Describe symptoms & get diagnoses", type: "page", path: "/symptom-checker" },
  { title: "Find Nearby Doctors", description: "Search local medical specialists", type: "page", path: "/doctors" },
  { title: "Mood Tracker Space", description: "Log daily emotions & view charts", type: "page", path: "/mood-tracker" },
  { title: "Tablet Identifier Scanner", description: "Scan medicine strips & tablets", type: "page", path: "/tablet-identifier" },
  { title: "AI Chat Health Assistant", description: "Chat with compassionate companion", type: "page", path: "/chat" },
  { title: "My Profile Details", description: "Edit wellness & medical settings", type: "page", path: "/profile" },
  { title: "FAQ & Help Center", description: "Access platform help guidelines", type: "settings", action: "open_help" },
  { title: "Dark Mode Toggle", description: "Switch light/dark styling mode", type: "settings", action: "toggle_theme" }
];

const SPECIALTIES = [
  { title: "General Physician", description: "Primary care medical doctor", type: "doctor", value: "General Physician", path: "/doctors" },
  { title: "Cardiologist", description: "Heart health specialist doctor", type: "doctor", value: "Cardiologist", path: "/doctors" },
  { title: "Neurologist", description: "Brain & nervous system specialist", type: "doctor", value: "Neurologist", path: "/doctors" },
  { title: "Dermatologist", description: "Skin, hair & nail disease specialist", type: "doctor", value: "Dermatologist", path: "/doctors" },
  { title: "ENT Specialist", description: "Ear, nose & throat doctor", type: "doctor", value: "ENT Specialist", path: "/doctors" },
  { title: "Pediatrician", description: "Children's health specialist doctor", type: "doctor", value: "Pediatrician", path: "/doctors" },
  { title: "Orthopedic Surgeon", description: "Bone & joint surgery specialist", type: "doctor", value: "Orthopedic Surgeon", path: "/doctors" },
  { title: "Gynecologist", description: "Women's reproductive health doctor", type: "doctor", value: "Gynecologist", path: "/doctors" }
];

const SYMPTOMS = [
  { title: "Check symptom: Headache", description: "Analyze head pain & pressure", type: "symptom", value: "headache", path: "/symptom-checker" },
  { title: "Check symptom: Fever", description: "Analyze high temperature & chills", type: "symptom", value: "fever", path: "/symptom-checker" },
  { title: "Check symptom: Cough", description: "Analyze throat irritation & congestion", type: "symptom", value: "cough", path: "/symptom-checker" },
  { title: "Check symptom: Sore Throat", description: "Analyze painful swallowing", type: "symptom", value: "sore throat", path: "/symptom-checker" },
  { title: "Check symptom: Fatigue", description: "Analyze chronic tiredness & lethargy", type: "symptom", value: "fatigue", path: "/symptom-checker" },
  { title: "Check symptom: Stomach Pain", description: "Analyze abdominal cramps or bloating", type: "symptom", value: "stomach pain", path: "/symptom-checker" }
];

const MEDICINES = [
  { title: "Identify: Paracetamol / Acetaminophen", description: "Scan paracetamol tablets", type: "medicine", value: "paracetamol", path: "/tablet-identifier" },
  { title: "Identify: Aspirin", description: "Scan aspirin pain-relief tablets", type: "medicine", value: "aspirin", path: "/tablet-identifier" },
  { title: "Identify: Ibuprofen / Advil", description: "Scan ibuprofen anti-inflammatory tablets", type: "medicine", value: "ibuprofen", path: "/tablet-identifier" },
  { title: "Identify: Amoxicillin", description: "Scan amoxicillin antibiotic tablets", type: "medicine", value: "amoxicillin", path: "/tablet-identifier" },
  { title: "Identify: Metformin", description: "Scan metformin diabetes control tablets", type: "medicine", value: "metformin", path: "/tablet-identifier" }
];

/**
 * GET /api/search?q=...
 * Search across pages, specialties, symptoms, and medicines
 */
router.get("/", (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).toLowerCase().trim() : "";
    if (!q) {
      return res.json([]);
    }

    const matches = [];

    // Filter pages
    PAGES.forEach(item => {
      if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
        matches.push(item);
      }
    });

    // Filter specialties
    SPECIALTIES.forEach(item => {
      if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
        matches.push(item);
      }
    });

    // Filter symptoms
    SYMPTOMS.forEach(item => {
      if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
        matches.push(item);
      }
    });

    // Filter medicines
    MEDICINES.forEach(item => {
      if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
        matches.push(item);
      }
    });

    res.json(matches.slice(0, 10)); // Limit to top 10 results
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

export default router;
