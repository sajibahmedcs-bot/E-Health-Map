/* ============================================================
   data.js — Static Content & Mock Data
============================================================ */

/* ── Tips page content ──────────────────────────────────── */
const TIPS_DATA = {
  tips: [
    {
      category: "sleep",
      title: "Improve Sleep",
      suggestions: [
        "Stick to a consistent sleep-wake schedule, even on weekends.",
        "Ensure your bedroom is dark, quiet, and cool.",
        "Avoid heavy meals and caffeine at least 4-6 hours before bedtime.",
        "Try a 10-minute winding down ritual like reading or meditation."
      ]
    },
    {
      category: "hydration",
      title: "Drink More Water",
      suggestions: [
        "Carry a reusable water bottle with you throughout the day.",
        "Set a phone reminder to drink water every 2 hours.",
        "Drink a full glass of water immediately after waking up.",
        "Eat more water-rich snacks like cucumber and watermelon."
      ]
    },
    {
      category: "activity",
      title: "Move Daily",
      suggestions: [
        "Take a 10-minute brisk walk after lunch to aid digestion.",
        "Use stairs instead of elevators whenever possible.",
        "Set an alarm to stand up and stretch every 60 minutes.",
        "Try a fun physical activity you enjoy, like dancing or cycling."
      ]
    },
    {
      category: "digital",
      title: "Reduce Screen Time",
      suggestions: [
        "Designate screen-free zones, such as the dining table.",
        "Switch to 'Night Shift' or 'Grayscale' mode in the evenings.",
        "Try a 'Digital Sunset'—no devices 60 minutes before bed.",
        "Engage in non-digital hobbies like gardening or painting."
      ]
    },
    {
      category: "stress",
      title: "Manage Stress",
      suggestions: [
        "Practice 'Box Breathing': inhale 4s, hold 4s, exhale 4s, hold 4s.",
        "Spend at least 15 minutes outdoors in natural light.",
        "Start a gratitude journal—write down 3 things you're thankful for daily.",
        "Connect with a friend or loved one for a brief conversation."
      ]
    }
  ]
};


/* ── Health Insights page content ───────────────────────── */
const INSIGHTS_DATA = {
  topics: [
    {
      id: "t2d",
      title: "Type 2 Diabetes",
      summary: "Type 2 diabetes is a condition where the body cannot properly use insulin, leading to high blood sugar levels. Lifestyle factors like diet and exercise play a crucial role. Maintaining a healthy weight and staying active may increase insulin sensitivity and lower blood sugar levels.",
      link: "https://www.who.int/news-room/fact-sheets/detail/diabetes"
    },
    {
      id: "heart",
      title: "Heart Disease",
      summary: "Cardiovascular diseases are the leading cause of death globally. High blood pressure and high cholesterol can be linked to heart issues. A diet low in saturated fats and regular aerobic exercise may reduce systemic inflammation and strengthen the heart muscle.",
      link: "https://www.who.int/health-topics/cardiovascular-diseases"
    },
    {
      id: "stroke",
      title: "Stroke",
      summary: "A stroke occurs when blood flow to the brain is interrupted. Chronic stress and poor sleep can be linked to hypertension, which is a major stroke risk factor. Awareness of blood pressure and regular check-ups may significantly lower the long-term risk.",
      link: "https://www.who.int/health-topics/cardiovascular-diseases"
    },
    {
      id: "hypertension",
      title: "High Blood Pressure",
      summary: "Often called the 'silent killer', high blood pressure affects millions. Excessive salt intake and lack of physical activity can be linked to increased arterial pressure. Reducing sodium and managing stress may help maintain optimal cardiovascular health.",
      link: "https://www.who.int/health-topics/hypertension"
    },
    {
      id: "mental",
      title: "Mental Health",
      summary: "Mental well-being is as important as physical health. Chronic stress and poor sleep may increase risk of anxiety and depression. Regular movement, hydration, and setting screen-time boundaries can be linked to improved mood and cognitive resilience.",
      link: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response"
    }
  ]
};


/* ── Brain & Body page content ──────────────────────────── */
const HEALTH_CONTENT = {
  brain_body: [
    {
      title: "Focus & Clarity",
      desc: "Your ability to concentrate is directly linked to your sleep consistency and hydration. Dehydration of just 1% can reduce cognitive performance by 10%.",
      category: "cognitive",
      actions: ["Drink water every 2 hours", "Limit screen use early in the morning"]
    },
    {
      title: "Energy & Vitality",
      desc: "Physical movement triggers the release of endorphins and improves mitochondrial efficiency. Even a 10-minute walk can lift sluggishness better than caffeine.",
      category: "physical",
      actions: ["Take the stairs", "Brisk 10-minute walk after lunch"]
    },
    {
      title: "Mood & Resilience",
      desc: "Chronic stress and high work hours elevate cortisol, which can lead to anxiety. Routine habits provide an 'anchor' for your mental well-being.",
      category: "mental",
      actions: ["Practice 4-7-8 breathing", "Journal for 5 minutes at night"]
    }
  ],
  warnings: [
    "Persistent mid-afternoon fatigue",
    "Difficulty falling asleep before midnight",
    "Reduced focus on complex tasks",
    "Irritability during busy work weeks"
  ],
  conditions: [
    {
      name: "Chronic Dehydration",
      symptoms: ["Dark colored urine", "Frequent headaches", "Extreme thirst", "Dizziness or lightheadedness"],
      impact: "Reduces brain volume temporarily, slowing cognitive processing and memory recall."
    },
    {
      name: "Insomnia Disorder",
      symptoms: ["Lying awake for long periods", "Waking up too early", "Not feeling refreshed after sleep", "Daytime sleepiness"],
      impact: "Interrupts the glymphatic system which clears cognitive waste during deep sleep."
    },
    {
      name: "Burnout Syndrome",
      symptoms: ["Emotional exhaustion", "Reduced performance", "Detachment from work", "Physical depletion"],
      impact: "Chronic cortisol elevation can shrink the prefrontal cortex, the seat of decision-making."
    },
    {
      name: "Metabolic Imbalance",
      symptoms: ["Increased hunger or thirst", "Blurred vision", "Frequent urination", "Slow-healing sores"],
      impact: "Poor glucose regulation leads to unstable energy and frequent 'brain fog' episodes."
    },
    {
      name: "Sedentary Syndrome",
      symptoms: ["Persistent lower back pain", "Tight hip flexors", "Poor posture", "Low metabolic rate"],
      impact: "Reduces blood flow to the brain, directly impacting creativity and long-term vitality."
    }
  ]
};


/* ── GP Finder mock data ─────────────────────────────────── */
const MOCK_GPS = [
  { id: 1, name: "Regent Health Centre",   address: "12 Regent Way, London, SE1 7PB",  distance: "0.4 miles", phone: "020 7928 9292", lat: 51.505, lng: -0.111 },
  { id: 2, name: "Southbank Medical",      address: "88 London St, London, SE1 8TY",   distance: "0.8 miles", phone: "020 7401 3911", lat: 51.503, lng: -0.108 },
  { id: 3, name: "City Care Clinic",       address: "42 Bridge Road, London, SE1 1EE", distance: "1.2 miles", phone: "020 7357 7322", lat: 51.501, lng: -0.115 },
  { id: 4, name: "Parkway Group Practice", address: "1-3 Parkway, London, SE1 0LH",    distance: "1.5 miles", phone: "020 7633 0080", lat: 51.508, lng: -0.118 }
];


/* ── Scoring guide ranges ────────────────────────────────── */
const HABIT_RANGES = [
  { label: "Optimal",   range: "86-100", color: "#10b981", icon: "sparkles",     desc: "Peak harmony between systems." },
  { label: "Good",      range: "71-85",  color: "#4DA6A6", icon: "thumbs-up",    desc: "Solid routine with minor gaps." },
  { label: "Fair",      range: "51-70",  color: "#f97316", icon: "minus",        desc: "Inconsistent inputs detected." },
  { label: "Poor",      range: "31-50",  color: "#fb7185", icon: "trending-down",desc: "Significant routine disruption." },
  { label: "Very Poor", range: "0-30",   color: "#dc2626", icon: "alert-circle", desc: "Critical depletion; prioritize rest." }
];
