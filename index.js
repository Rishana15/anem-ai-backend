const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'anem-ai-secret-key-2026';

// In-memory storage (resets on restart, good enough for demo)
const users = [];
const history = [];

// ─── ARTICLES DATA ───────────────────────────────────────────
const articles = [
  {
    id: "1",
    title: "Understanding Anemia: Causes and Symptoms",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800",
    description: "Anemia occurs when you don't have enough healthy red blood cells to carry adequate oxygen to your body's tissues.",
    content: "Anemia is a condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body's tissues. Having anemia, also referred to as low hemoglobin, can make you feel tired and weak. There are many forms of anemia, each with its own cause. Anemia can be temporary or long term and can range from mild to severe.",
    sourceUrl: "https://www.mayoclinic.org/diseases-conditions/anemia",
    createdAt: "2026-02-27T00:00:00.000Z"
  },
  {
    id: "2",
    title: "Iron-Rich Foods to Combat Anemia",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    description: "Diet plays a crucial role in preventing and treating iron-deficiency anemia.",
    content: "Eating iron-rich foods can help boost your iron levels and prevent anemia. Great sources of iron include red meat, pork and poultry, seafood, beans, dark green leafy vegetables such as spinach, dried fruit such as raisins and apricots, iron-fortified cereals, breads and pastas, and peas.",
    sourceUrl: "https://www.healthline.com/nutrition/iron-rich-foods",
    createdAt: "2026-02-26T00:00:00.000Z"
  },
  {
    id: "3",
    title: "When to See a Doctor About Anemia",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
    description: "Learn the warning signs that indicate you should seek medical attention for anemia.",
    content: "Make an appointment with your doctor if you are feeling fatigued. Some types of anemia, such as iron deficiency anemia or B-12 deficiency anemia, are common. Fatigue has many causes besides anemia, so do not assume that if you are tired you must be anemic. Some people learn that their hemoglobin is low, which indicates anemia, when they go to donate blood.",
    sourceUrl: "https://www.mayoclinic.org/diseases-conditions/anemia/symptoms-causes",
    createdAt: "2026-02-25T00:00:00.000Z"
  },
  {
    id: "4",
    title: "Anemia in Children: What Parents Should Know",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800",
    description: "Children are especially vulnerable to anemia. Learn how to protect your child.",
    content: "Anemia is a common problem in children. About 20% of children in the U.S. will be diagnosed with anemia at some point. A child who has anemia does not have enough red blood cells or hemoglobin. Hemoglobin is a protein inside red blood cells. It carries oxygen to all parts of the body.",
    sourceUrl: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/anemia",
    createdAt: "2026-02-24T00:00:00.000Z"
  },
  {
    id: "5",
    title: "How Eye Scans Can Detect Anemia",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
    description: "New research shows that analyzing the inner eyelid can reveal signs of anemia.",
    content: "Researchers have developed a smartphone-based tool that analyzes the color of the inner eyelid to detect anemia. The conjunctiva, the tissue lining the inner eyelid, changes color when a person is anemic. This non-invasive method could be particularly useful in low-resource settings where lab tests are not readily available.",
    sourceUrl: "https://www.nature.com/articles/s41746-020-0255-1",
    createdAt: "2026-02-23T00:00:00.000Z"
  }
];

// ─── HELPER ──────────────────────────────────────────────────
function getMockPrediction(userId) {
  const results = ['Anemia Detected', 'No Anemia Detected'];
  const result = results[Math.floor(Math.random() * results.length)];
  const isAnemia = result === 'Anemia Detected';

  const detection = {
    id: uuidv4(),
    user_id: userId,
    hasil: result,
    image_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400",
    waktu_prediksi: new Date().toISOString(),
    akurasi: (80 + Math.random() * 15).toFixed(1),
    deskripsi: isAnemia
      ? "Based on the eye scan analysis, signs of anemia were detected in the conjunctiva. The pale coloration of the inner eyelid suggests lower than normal hemoglobin levels."
      : "Based on the eye scan analysis, no significant signs of anemia were detected. The conjunctiva shows normal coloration indicating adequate hemoglobin levels.",
    informasi_tambahan: isAnemia ? {
      gayahidup_sehat: "Maintain a balanced diet rich in iron and vitamin C. Get regular moderate exercise and adequate sleep. Avoid excessive tea or coffee which inhibits iron absorption.",
      tindakan_saran: "Consult a hematologist for a complete blood count (CBC) test. Consider iron supplementation as prescribed by your doctor. Follow up in 4-6 weeks.",
      perawatan_medis: "Visit a doctor for laboratory confirmation including CBC, serum ferritin, and iron studies. Treatment may include iron supplements or dietary changes.",
      risiko_komplikasi: "If left untreated, anemia can lead to heart problems, pregnancy complications, growth issues in children, and severe fatigue affecting daily activities.",
      pencegahan: "Consume foods rich in iron such as spinach, red meat, and legumes. Pair iron-rich foods with vitamin C to enhance absorption. Get regular blood checkups."
    } : {
      gayahidup_sehat: "Continue maintaining a healthy balanced diet. Stay hydrated and exercise regularly. Get annual health checkups to monitor your blood levels.",
      tindakan_saran: "Continue current healthy lifestyle. Consider periodic blood tests as part of routine health checkups especially if you experience fatigue.",
      perawatan_medis: "No immediate medical treatment needed. Maintain regular health checkups and consult your doctor if symptoms like fatigue or dizziness develop.",
      risiko_komplikasi: "While currently no anemia detected, maintain healthy habits to prevent future development. Monitor for symptoms like persistent fatigue or paleness.",
      pencegahan: "Maintain iron-rich diet, stay physically active, and get regular health screenings to keep your blood levels in healthy range."
    }
  };

  history.push(detection);
  return detection;
}

// ─── AUTH ROUTES ─────────────────────────────────────────────
app.post('/auth/register', async (req, res) => {
  try {
    const { name, birthDate, gender, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: false, message: 'Name, email and password are required' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name,
      birthDate,
      gender,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    res.json({
      status: true,
      message: 'Registration successful! Please login to continue.'
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Email not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ status: false, message: 'Wrong password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });

    res.json({
      status: true,
      message: 'Login successful',
      token,
      data: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
});

// ─── USER ROUTES ─────────────────────────────────────────────
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    // Return mock user if not found (for mock_user_123)
    return res.json({
      status: true,
      userResult: {
        id: req.params.id,
        name: "Demo User",
        email: "demo@anem.ai",
        birthDate: "2000-01-01",
        gender: "Male"
      }
    });
  }
  res.json({
    status: true,
    userResult: {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
      gender: user.gender
    }
  });
});

// ─── ARTICLE ROUTES ──────────────────────────────────────────
app.get('/articles', (req, res) => {
  res.json(articles);
});

app.get('/articles/:id', (req, res) => {
  const article = articles.find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

// ─── PREDICTION ROUTE ────────────────────────────────────────
app.post('/predict', (req, res) => {
  const userId = req.body.user_id || 'unknown';
  const result = getMockPrediction(userId);
  res.json(result);
});

// ─── HISTORY ROUTE ───────────────────────────────────────────
app.get('/history/:id', (req, res) => {
  const userId = req.params.id.replace(/"/g, '');
  const userHistory = history.filter(h => h.user_id === userId);

  if (userHistory.length === 0) {
    // Return mock history
    return res.json([getMockPrediction(userId)]);
  }

  res.json(userHistory);
});

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: true, message: 'Anem.ai API is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
