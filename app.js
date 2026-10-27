
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ================================================
// COSMOS EXPLORER — optimized Three.js solar system
// ================================================

const $ = (selector) => document.querySelector(selector);
const container = $("#space-container");
const status = $("#status");
const errorBox = $("#error-message");

if (!container) throw new Error("Missing #space-container element.");

const isMobile = window.matchMedia("(max-width: 700px)").matches;
const pixelRatioLimit = isMobile ? 1.15 : 1.5;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030611);
scene.fog = new THREE.FogExp2(0x030611, 0.0008);

const camera = new THREE.PerspectiveCamera(
  48, window.innerWidth / window.innerHeight, 0.1, 600
);
const overviewPosition = new THREE.Vector3(0, 19, 35);
camera.position.copy(overviewPosition);

const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile,
  powerPreference: "high-performance",
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioLimit));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1.3;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 0, 0);

// Lights
scene.add(new THREE.AmbientLight(0x8a9dbc, 0.9));

const sunlight = new THREE.PointLight(0xffd7a0, 1500, 220, 1.4);
sunlight.position.set(0, 0, 0);
scene.add(sunlight);

// ================================================
// TEXTURES — uses the existing ./textures directory
// ================================================

const loader = new THREE.TextureLoader();
const textureCache = new Map();
const textureFailures = new Set();

function getTexture(filename) {
  if (textureCache.has(filename)) return textureCache.get(filename);

  const texture = loader.load(
    `./textures/${filename}`,
    undefined,
    undefined,
    () => {
      textureFailures.add(filename);
      console.warn(`Texture failed to load: ./textures/${filename}`);
      if (status) status.textContent = `ছবি পাওয়া যায়নি: ${filename}`;
    }
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(filename, texture);
  return texture;
}

// ================================================
// STARFIELD — one lightweight point cloud
// ================================================

const starCount = isMobile ? 1100 : 2400;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const radius = 50 + Math.random() * 150;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const k = i * 3;

  starPositions[k] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[k + 1] = radius * Math.cos(phi);
  starPositions[k + 2] = radius * Math.sin(phi) * Math.sin(theta);

  const brightness = 0.5 + Math.random() * 0.5;
  starColors[k] = brightness * 0.75;
  starColors[k + 1] = brightness * 0.85;
  starColors[k + 2] = brightness;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
  "position", new THREE.BufferAttribute(starPositions, 3)
);
starGeometry.setAttribute(
  "color", new THREE.BufferAttribute(starColors, 3)
);

const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    size: isMobile ? 0.12 : 0.15,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  })
);
scene.add(stars);

// ================================================
// GLOW
// ================================================

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);

  gradient.addColorStop(0, "rgba(255,245,195,0.75)");
  gradient.addColorStop(0.22, "rgba(255,160,45,0.32)");
  gradient.addColorStop(0.55, "rgba(255,75,15,0.10)");
  gradient.addColorStop(1, "rgba(255,60,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

// ================================================
// CELESTIAL OBJECT DATA
// Distances and sizes are compressed for visualization.
// ================================================

const objectsData = [
  {
    id: "Mercury", name: "বুধ", type: "গ্রহ",
    texture: "2k_mercury.jpg", size: 0.20, distance: 3,
    orbitSpeed: 0.95, rotation: 0.25,
    diameter: "৪,৮৭৯ কিমি",
    distanceText: "৫৭.৯ মিলিয়ন কিমি",
    day: "প্রায় ৫৮.৬ পৃথিবী-দিন",
    year: "৮৮ পৃথিবী-দিন",
    atmosphere: "অত্যন্ত পাতলা exosphere",
    moons: "কোনো পরিচিত প্রাকৃতিক উপগ্রহ নেই",
    facts: [
      "সূর্যের সবচেয়ে কাছের গ্রহ।",
      "এটি সৌরজগতের সবচেয়ে ছোট প্রধান গ্রহ।",
      "এর পৃষ্ঠে প্রচুর impact crater রয়েছে।"
    ]
  },
  {
    id: "Venus", name: "শুক্র", type: "গ্রহ",
    texture: "2k_venus_surface.jpg", size: 0.32, distance: 4.15,
    orbitSpeed: 0.72, rotation: -0.06,
    diameter: "১২,১০৪ কিমি",
    distanceText: "১০৮.২ মিলিয়ন কিমি",
    day: "প্রায় ২৪৩ পৃথিবী-দিন",
    year: "প্রায় ২২৫ পৃথিবী-দিন",
    atmosphere: "ঘন কার্বন ডাই-অক্সাইড",
    moons: "কোনো পরিচিত প্রাকৃতিক উপগ্রহ নেই",
    facts: [
      "পৃষ্ঠের গড় তাপমাত্রা প্রায় ৪৬৫°C।",
      "ঘন বায়ুমণ্ডল তাপ আটকে রাখে।",
      "এটি অধিকাংশ গ্রহের বিপরীত দিকে ঘোরে।"
    ]
  },
  {
    id: "Earth", name: "পৃথিবী", type: "গ্রহ",
    texture: "2k_earth_daymap.jpg", size: 0.35, distance: 5.45,
    orbitSpeed: 0.52, rotation: 0.7,
    diameter: "১২,৭৪২ কিমি",
    distanceText: "১৪৯.৬ মিলিয়ন কিমি",
    day: "প্রায় ২৪ ঘণ্টা",
    year: "প্রায় ৩৬৫.২৫ দিন",
    atmosphere: "প্রধানত নাইট্রোজেন ও অক্সিজেন",
    moons: "১টি—চাঁদ",
    facts: [
      "এখন পর্যন্ত নিশ্চিত প্রাণের অস্তিত্ব থাকা একমাত্র পরিচিত গ্রহ।",
      "পৃষ্ঠের প্রায় ৭১% জল দিয়ে ঢাকা।",
      "এর চৌম্বক ক্ষেত্র সূর্য থেকে আসা চার্জযুক্ত কণার বিরুদ্ধে সুরক্ষায় সাহায্য করে।"
    ]
  },
  {
    id: "Mars", name: "মঙ্গল", type: "গ্রহ",
    texture: "2k_mars.jpg", size: 0.27, distance: 6.9,
    orbitSpeed: 0.39, rotation: 0.68,
    diameter: "৬,৭৭৯ কিমি",
    distanceText: "২২৭.৯ মিলিয়ন কিমি",
    day: "প্রায় ২৪ ঘণ্টা ৩৭ মিনিট",
    year: "৬৮৭ পৃথিবী-দিন",
    atmosphere: "পাতলা; প্রধানত কার্বন ডাই-অক্সাইড",
    moons: "২টি—Phobos ও Deimos",
    facts: [
      "লোহা-সমৃদ্ধ ধুলোর কারণে লালচে দেখায়।",
      "এখানে Olympus Mons নামে বিশাল আগ্নেয়গিরি রয়েছে।",
      "রোভার দিয়ে বিজ্ঞানীরা এর প্রাচীন পরিবেশ অনুসন্ধান করছেন।"
    ]
  },
  {
    id: "Jupiter", name: "বৃহস্পতি", type: "গ্যাস জায়ান্ট",
    texture: "2k_jupiter.jpg", size: 0.88, distance: 9.35,
    orbitSpeed: 0.21, rotation: 1,
    diameter: "প্রায় ১,৩৯,৮২০ কিমি",
    distanceText: "৭৭৮.৬ মিলিয়ন কিমি",
    day: "প্রায় ৯ ঘণ্টা ৫৬ মিনিট",
    year: "প্রায় ১১.৯ পৃথিবী-বছর",
    atmosphere: "প্রধানত হাইড্রোজেন ও হিলিয়াম",
    moons: "৯০টির বেশি; সংখ্যা আবিষ্কার ও স্বীকৃতির সঙ্গে বদলায়",
    facts: [
      "সৌরজগতের বৃহত্তম গ্রহ।",
      "Great Red Spot একটি বিশাল, দীর্ঘস্থায়ী ঝড়।",
      "Europa-র বরফের নিচে সমুদ্র থাকতে পারে বলে ধারণা করা হয়।"
    ]
  },
  {
    id: "Saturn", name: "শনি", type: "গ্যাস জায়ান্ট",
    texture: "2k_saturn.jpg", size: 0.73, distance: 12,
    orbitSpeed: 0.15, rotation: 0.9,
    diameter: "প্রায় ১,১৬,৪৬০ কিমি",
    distanceText: "১,৪৩৩.৫ মিলিয়ন কিমি",
    day: "প্রায় ১০.৭ ঘণ্টা",
    year: "প্রায় ২৯.৪ পৃথিবী-বছর",
    atmosphere: "প্রধানত হাইড্রোজেন ও হিলিয়াম",
    moons: "অনেক; Titan অন্যতম বড়",
    facts: [
      "এর বলয় বরফ, ধুলো ও পাথুরে কণা দিয়ে গঠিত।",
      "Titan-এর ঘন বায়ুমণ্ডল ও তরল হাইড্রোকার্বনের হ্রদ রয়েছে।",
      "শনির বলয় বিভিন্ন ঘনত্ব ও গঠনের বহু অংশে বিভক্ত।"
    ]
  },
  {
    id: "Uranus", name: "ইউরেনাস", type: "আইস জায়ান্ট",
    texture: "2k_uranus.jpg", size: 0.52, distance: 14.5,
    orbitSpeed: 0.105, rotation: -0.55,
    diameter: "প্রায় ৫০,৭২৪ কিমি",
    distanceText: "২,৮৭২.৫ মিলিয়ন কিমি",
    day: "প্রায় ১৭ ঘণ্টা ১৪ মিনিট",
    year: "প্রায় ৮৪ পৃথিবী-বছর",
    atmosphere: "হাইড্রোজেন, হিলিয়াম ও মিথেন",
    moons: "২৮টির বেশি পরিচিত উপগ্রহ",
    facts: [
      "এর অক্ষ প্রায় ৯৮° কাত হয়ে আছে।",
      "মিথেন এর নীল-সবুজ রঙে ভূমিকা রাখে।",
      "এটি একটি ice giant।"
    ]
  },
  {
    id: "Neptune", name: "নেপচুন", type: "আইস জায়ান্ট",
    texture: "2k_neptunejpg.jpg", size: 0.50, distance: 16.6,
    orbitSpeed: 0.082, rotation: 0.62,
    diameter: "প্রায় ৪৯,২৪৪ কিমি",
    distanceText: "৪,৪৯৫ মিলিয়ন কিমি",
    day: "প্রায় ১৬ ঘণ্টা",
    year: "প্রায় ১৬৫ পৃথিবী-বছর",
    atmosphere: "হাইড্রোজেন, হিলিয়াম ও মিথেন",
    moons: "১৬টি পরিচিত উপগ্রহ",
    facts: [
      "সূর্য থেকে সবচেয়ে দূরের স্বীকৃত প্রধান গ্রহ।",
      "এর বায়ুমণ্ডলে অত্যন্ত দ্রুত বাতাস প্রবাহিত হয়।",
      "Triton একটি বড় উপগ্রহ, যা বিপরীত দিকে কক্ষপথে চলে।"
    ]
  },
  {
    id: "Ceres", name: "Ceres", type: "বামন গ্রহ",
    size: 0.15, distance: 7.9, orbitSpeed: 0.29, rotation: 0.2,
    color: 0x9a968e,
    diameter: "প্রায় ৯৪০ কিমি",
    distanceText: "সূর্য থেকে গড়ে প্রায় ৪১৪ মিলিয়ন কিমি",
    day: "প্রায় ৯ ঘণ্টা",
    year: "প্রায় ৪.৬ পৃথিবী-বছর",
    atmosphere: "স্থায়ী ঘন বায়ুমণ্ডল নেই",
    moons: "পরিচিত প্রাকৃতিক উপগ্রহ নেই",
    facts: [
      "এটি প্রধান গ্রহাণু বলয়ের সবচেয়ে বড় বস্তু।",
      "এর পৃষ্ঠে উজ্জ্বল লবণসমৃদ্ধ অঞ্চল পাওয়া গেছে।",
      "Dwarf planet হিসেবে শ্রেণিবদ্ধ।"
    ]
  },
  {
    id: "Pluto", name: "প্লুটো", type: "বামন গ্রহ",
    texture: "2k_mars.jpg", size: 0.16, distance: 19.5,
    orbitSpeed: 0.055, rotation: 0.15,
    diameter: "প্রায় ২,৩৭৭ কিমি",
    distanceText: "সূর্য থেকে গড়ে প্রায় ৫.৯ বিলিয়ন কিমি",
    day: "প্রায় ৬.৪ পৃথিবী-দিন",
    year: "প্রায় ২৪৮ পৃথিবী-বছর",
    atmosphere: "পাতলা; প্রধানত নাইট্রোজেন",
    moons: "৫টি পরিচিত উপগ্রহ",
    facts: [
      "২০০৬ সালে একে বামন গ্রহ হিসেবে শ্রেণিবদ্ধ করা হয়।",
      "এর সবচেয়ে বড় উপগ্রহ Charon।",
      "এটি Kuiper Belt অঞ্চলে অবস্থিত।"
    ]
  }
];

const extraData = {
  Sun: {
    name: "সূর্য", type: "নক্ষত্র",
    subtitle: "আমাদের সৌরজগতের কেন্দ্রীয় নক্ষত্র",
    diameter: "প্রায় ১৩.৯ লাখ কিমি",
    distanceText: "সৌরজগতের কেন্দ্র",
    day: "অক্ষাংশভেদে প্রায় ২৫–৩৫ দিন",
    year: "গ্যালাক্সির কেন্দ্রকে একবার প্রদক্ষিণে প্রায় ২২.৫–২৫ কোটি বছর",
    atmosphere: "প্রধানত হাইড্রোজেন ও হিলিয়াম",
    moons: "গ্রহ নয়; এর কোনো প্রাকৃতিক উপগ্রহ নেই",
    facts: [
      "কেন্দ্রে নিউক্লিয়ার ফিউশনের মাধ্যমে শক্তি উৎপন্ন হয়।",
      "দৃশ্যমান পৃষ্ঠের তাপমাত্রা প্রায় ৫,৫০০°C।",
      "সৌরজগতের মোট ভরের প্রায় ৯৯.৮৬% সূর্যে কেন্দ্রীভূত।"
    ]
  },
  Moon: {
    name: "চাঁদ", type: "প্রাকৃতিক উপগ্রহ",
    subtitle: "পৃথিবীর একমাত্র প্রাকৃতিক উপগ্রহ",
    diameter: "প্রায় ৩,৪৭৫ কিমি",
    distanceText: "পৃথিবী থেকে গড়ে ৩৮৪,৪০০ কিমি",
    day: "একবার ঘূর্ণনে প্রায় ২৭.৩ দিন",
    year: "পৃথিবীকে প্রদক্ষিণে প্রায় ২৭.৩ দিন",
    atmosphere: "অত্যন্ত ক্ষীণ exosphere",
    moons: "পৃথিবীর একমাত্র প্রাকৃতিক উপগ্রহ",
    facts: [
      "চাঁদের একই দিক সাধারণত পৃথিবীর দিকে থাকে।",
      "পৃষ্ঠে গর্ত, পর্বত ও বিস্তীর্ণ সমতল রয়েছে।",
      "চাঁদের পর্যায় সূর্য, পৃথিবী ও চাঁদের আপেক্ষিক অবস্থানের কারণে দেখা যায়।"
    ]
  },
  Halley: {
    name: "Halley’s Comet", type: "ধূমকেতু",
    subtitle: "সূর্যকে প্রদক্ষিণকারী বিখ্যাত ধূমকেতু",
    diameter: "কেন্দ্রের আনুমানিক ১১ × ১৫ কিমি",
    distanceText: "দূরত্ব কক্ষপথের অবস্থানের সঙ্গে বদলায়",
    day: "নিজ অক্ষে ঘূর্ণন প্রায় ২.২ দিন",
    year: "প্রায় ৭৫–৭৬ পৃথিবী-বছর",
    atmosphere: "সূর্যের কাছে এলে গ্যাস ও ধুলোর coma তৈরি হয়",
    moons: "প্রযোজ্য নয়",
    facts: [
      "শেষবার সূর্যের কাছে এসেছিল ১৯৮৬ সালে।",
      "পরবর্তী প্রত্যাবর্তন আনুমানিক ২০৬১ সালে।",
      "এখানে দেখানো কক্ষপথ ও গতি শিক্ষামূলক আনুমানিক মডেল।"
    ]
  }
};

// ================================================
// SUN
// ================================================

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.45, 40, 40),
  new THREE.MeshBasicMaterial({ map: getTexture("2k_sun.jpg") })
);
sun.name = "Sun";
sun.userData.objectName = "Sun";
scene.add(sun);

const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: makeGlowTexture(),
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
}));
sunGlow.scale.set(5.6, 5.6, 1);
sun.add(sunGlow);

// ================================================
// ORBITS, LABELS, PLANETS, DWARF PLANETS
// ================================================

const objects = { Sun: sun };
const pivots = {};
const animated = [];
const clickables = [sun];
const labels = [];
const orbitLines = [];

function makeOrbit(radius, parent = scene, color = 0x345581) {
  const segments = isMobile ? 72 : 120;
  const points = [];

  for (let i = 0; i < segments; i++) {
    const angle = i / segments * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius, 0, Math.sin(angle) * radius
    ));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineLoop(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.42
    })
  );
  parent.add(line);
  orbitLines.push(line);
  return line;
}

function makeLabel(text, color = "#eaf4ff") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(3,8,22,0.78)";
  ctx.fillRect(6, 7, 244, 50);
  ctx.strokeStyle = "rgba(115,215,255,0.42)";
  ctx.strokeRect(6, 7, 244, 50);
  ctx.font = "bold 25px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  }));
  sprite.scale.set(1.6, 0.4, 1);
  labels.push(sprite);
  return sprite;
}

function makePlanet(data) {
  makeOrbit(data.distance);

  const pivot = new THREE.Group();
  scene.add(pivot);

  const material = new THREE.MeshStandardMaterial({
    map: data.texture ? getTexture(data.texture) : null,
    color: data.color ?? 0xffffff,
    roughness: 0.94,
    metalness: 0
  });

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, isMobile ? 20 : 32, isMobile ? 20 : 32),
    material
  );
  planet.position.x = data.distance;
  planet.name = data.id;
  planet.userData.objectName = data.id;
  pivot.add(planet);

  const label = makeLabel(data.name);
  label.position.set(data.distance, data.size + 0.42, 0);
  pivot.add(label);

  if (data.id === "Saturn") {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(data.size * 1.28, data.size * 2.2, 72),
      new THREE.MeshStandardMaterial({
        color: 0xd5c39e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
        roughness: 1,
        depthWrite: false
      })
    );
    ring.rotation.x = -Math.PI / 2 + 0.25;
    ring.rotation.z = 0.08;
    planet.add(ring);
  }

  objects[data.id] = planet;
  pivots[data.id] = pivot;
  clickables.push(planet);
  animated.push({
    id: data.id, pivot, planet,
    orbitSpeed: data.orbitSpeed,
    rotationSpeed: data.rotation
  });
}

objectsData.forEach(makePlanet);

// ================================================
// EARTH'S MOON — parented to Earth's orbiting planet
// ================================================

const moonOrbit = new THREE.Group();
moonOrbit.position.set(5.45, 0, 0);
pivots.Earth.add(moonOrbit);
makeOrbit(0.85, moonOrbit, 0x91a8c5);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.095, 20, 20),
  new THREE.MeshStandardMaterial({
    map: getTexture("2k_moon.jpg"),
    roughness: 1
  })
);
moon.position.x = 0.85;
moon.name = "Moon";
moon.userData.objectName = "Moon";
moonOrbit.add(moon);

const moonLabel = makeLabel("চাঁদ");
moonLabel.position.set(0.85, 0.25, 0);
moonOrbit.add(moonLabel);

objects.Moon = moon;
clickables.push(moon);
animated.push({
  id: "Moon",
  pivot: moonOrbit,
  planet: moon,
  orbitSpeed: 1.7,
  rotationSpeed: 0.2
});

// ================================================
// ASTEROID BELT — instanced meshes for performance
// ================================================

function makeAsteroidBelt() {
  const count = isMobile ? 500 : 1100;
  const geometry = new THREE.IcosahedronGeometry(0.035, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x898b96,
    roughness: 1
  });
  const belt = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 7.35 + Math.random() * 1.1;
    dummy.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 0.32,
      Math.sin(angle) * radius
    );
    const scale = 0.35 + Math.random() * 1.6;
    dummy.scale.setScalar(scale);
    dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    dummy.updateMatrix();
    belt.setMatrixAt(i, dummy.matrix);
  }

  belt.instanceMatrix.needsUpdate = true;
  scene.add(belt);
  return belt;
}
const asteroidBelt = makeAsteroidBelt();

// ================================================
// COMET — approximate animated educational model
// ================================================

const cometPivot = new THREE.Group();
scene.add(cometPivot);

const cometHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0xb9d9ed,
    emissive: 0x233b59,
    roughness: 0.7
  })
);
cometPivot.add(cometHead);

const tailGeometry = new THREE.BufferGeometry();
const tailVertices = new Float32Array([
  0, 0, 0, -1.3, 0.12, 0.05,
  0, 0, 0, -1.7, -0.12, 0.03,
  0, 0, 0, -1.4, 0, -0.08
]);
tailGeometry.setAttribute("position", new THREE.BufferAttribute(tailVertices, 3));

const cometTail = new THREE.LineSegments(
  tailGeometry,
  new THREE.LineBasicMaterial({
    color: 0x82d7ff,
    transparent: true,
    opacity: 0.72
  })
);
cometPivot.add(cometTail);

const cometOrbitRadius = 21.8;
makeOrbit(cometOrbitRadius, scene, 0x47749c);
cometPivot.position.set(cometOrbitRadius, 0.3, 0);
objects.Halley = cometHead;
clickables.push(cometHead);

// ================================================
// INFORMATION PANEL
// ================================================

const infoPanel = $("#info-panel");
const nameEl = $("#object-name");
const subtitleEl = $("#object-subtitle");
const factsEl = $("#object-facts");
let selectedId = "Sun";

function getObjectData(id) {
  if (id === "Sun") return extraData.Sun;
  if (id === "Moon") return extraData.Moon;
  if (id === "Halley") return extraData.Halley;
  return objectsData.find((item) => item.id === id) || null;
}

function showObject(id) {
  const data = getObjectData(id);
  if (!data) return;

  selectedId = id;
  nameEl.textContent = data.name;
  subtitleEl.textContent = data.subtitle || `${data.id} • ${data.type || "মহাজাগতিক বস্তু"}`;
  factsEl.replaceChildren();

  const stats = [
    ["শ্রেণি", data.type],
    ["ব্যাস", data.diameter],
    ["সূর্য থেকে গড় দূরত্ব", data.distanceText],
    ["দিনের দৈর্ঘ্য", data.day],
    ["বছর / কক্ষপথ", data.year],
    ["বায়ুমণ্ডল", data.atmosphere],
    ["উপগ্রহ", data.moons]
  ];

  for (const [label, value] of stats) {
    if (!value) continue;
    const row = document.createElement("div");
    row.className = "fact-row";

    const heading = document.createElement("span");
    heading.textContent = label;
    const content = document.createElement("strong");
    content.textContent = value;

    row.append(heading, content);
    factsEl.appendChild(row);
  }

  for (const fact of data.facts || []) {
    const paragraph = document.createElement("p");
    paragraph.className = "fact-note";
    paragraph.textContent = "✦ " + fact;
    factsEl.appendChild(paragraph);
  }

  infoPanel.classList.remove("hidden");
  document.querySelectorAll(".planet-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.object === id);
  });

  if (status) status.textContent = `${data.name} নির্বাচন করা হয়েছে`;
}

// ================================================
// CAMERA FOCUS / RESET
// ================================================

let cameraMove = null;

function worldPosition(object) {
  const position = new THREE.Vector3();
  object.getWorldPosition(position);
  return position;
}

function focusObject(id) {
  const object = objects[id];
  if (!object) {
    if (status) status.textContent = "এই বস্তুর 3D মডেল পাওয়া যায়নি";
    return;
  }

  const target = worldPosition(object);
  let radius = object.geometry?.parameters?.radius ?? 0.3;

  if (id === "Saturn") radius *= 2.25;
  if (id === "Sun") radius = 1.45;

  const distance = THREE.MathUtils.clamp(radius * 5, 2.5, 9);
  const direction = new THREE.Vector3(1, 0.38, 1).normalize();
  const destination = target.clone().add(direction.multiplyScalar(distance));

  cameraMove = {
    fromCamera: camera.position.clone(),
    toCamera: destination,
    fromTarget: controls.target.clone(),
    toTarget: target,
    elapsed: 0,
    duration: 0.85
  };

  if (status) status.textContent = `${id} এর দিকে ক্যামেরা যাচ্ছে`;
}

function resetView() {
  cameraMove = {
    fromCamera: camera.position.clone(),
    toCamera: overviewPosition.clone(),
    fromTarget: controls.target.clone(),
    toTarget: new THREE.Vector3(0, 0, 0),
    elapsed: 0,
    duration: 0.85
  };
  showObject("Sun");
  if (status) status.textContent = "সম্পূর্ণ সৌরজগতের দৃশ্য";
}

// ================================================
// SEARCH + UI EVENTS
// ================================================

function normalize(value) {
  return value.trim().toLowerCase();
}

function searchObject() {
  const query = normalize($("#object-search").value);
  if (!query) return;

  const candidates = [
    ...objectsData.map((item) => ({ id: item.id, name: item.name })),
    { id: "Sun", name: "সূর্য" },
    { id: "Moon", name: "চাঁদ" },
    { id: "Halley", name: "Halley's Comet" }
  ];

  const match = candidates.find((item) =>
    normalize(item.id) === query ||
    normalize(item.name) === query
  );

  if (!match) {
    if (status) status.textContent = "বস্তুটি পাওয়া যায়নি—ইংরেজি নাম দিয়ে চেষ্টা করো";
    return;
  }

  showObject(match.id);
  focusObject(match.id);
}

$("#search-btn").addEventListener("click", searchObject);
$("#object-search").addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchObject();
});

document.querySelectorAll(".planet-button").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.object;
    showObject(id);
    focusObject(id);
  });
});

$("#focus-btn").addEventListener("click", () => focusObject(selectedId));
$("#reset-btn").addEventListener("click", resetView);
$("#close-info").addEventListener("click", () => infoPanel.classList.add("hidden"));

let paused = false;
const speeds = [1, 3, 8];
let speedIndex = 0;

$("#pause-btn").addEventListener("click", () => {
  paused = !paused;
  $("#pause-btn").textContent = paused ? "▶ Resume" : "Ⅱ Pause";
  if (status) status.textContent = paused ? "অ্যানিমেশন থামানো হয়েছে" : "মহাকাশ অভিযান চলছে";
});

$("#speed-btn").addEventListener("click", () => {
  speedIndex = (speedIndex + 1) % speeds.length;
  $("#speed-btn").textContent = `গতি ${speeds[speedIndex]}×`;
});

let orbitsVisible = true;
$("#orbit-btn").addEventListener("click", () => {
  orbitsVisible = !orbitsVisible;
  orbitLines.forEach((line) => line.visible = orbitsVisible);
  $("#orbit-btn").textContent = `Orbit: ${orbitsVisible ? "ON" : "OFF"}`;
});

let labelsVisible = true;
$("#label-btn").addEventListener("click", () => {
  labelsVisible = !labelsVisible;
  labels.forEach((label) => label.visible = labelsVisible);
  $("#label-btn").textContent = `Labels: ${labelsVisible ? "ON" : "OFF"}`;
});

// Guided tour
const tourIds = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
let tourIndex = -1;

$("#tour-btn").addEventListener("click", () => {
  tourIndex++;

  if (tourIndex >= tourIds.length) {
    tourIndex = -1;
    $("#tour-btn").textContent = "▶ Guided Tour";
    if (status) status.textContent = "Guided Tour শেষ হয়েছে";
    return;
  }

  const id = tourIds[tourIndex];
  showObject(id);
  focusObject(id);
  $("#tour-btn").textContent = "▶ Next Tour Stop";
});

// ================================================
// CLICK-TO-SELECT WITH RAYCASTING
// ================================================

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerStart = null;

renderer.domElement.addEventListener("pointerdown", (event) => {
  pointerStart = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener("pointerup", (event) => {
  if (!pointerStart) return;

  const moved = Math.hypot(
    event.clientX - pointerStart.x,
    event.clientY - pointerStart.y
  );
  pointerStart = null;
  if (moved > 6) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(clickables, false);
  if (!hits.length) return;

  const id = hits[0].object.userData.objectName;
  if (!id) return;

  showObject(id);
  focusObject(id);
});

// ================================================
// ANIMATION
// ================================================

const clock = new THREE.Clock();
let elapsedTime = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (!paused) {
    const timeScale = speeds[speedIndex];
    elapsedTime += delta * timeScale;

    sun.rotation.y += delta * 0.12 * timeScale;
    stars.rotation.y += delta * 0.002;

    for (const item of animated) {
      item.pivot.rotation.y += delta * item.orbitSpeed * 0.12 * timeScale;
      item.planet.rotation.y += delta * item.rotationSpeed * timeScale;
    }

    cometPivot.position.set(
      Math.cos(elapsedTime * 0.025) * cometOrbitRadius,
      0.3 + Math.sin(elapsedTime * 0.04) * 0.5,
      Math.sin(elapsedTime * 0.025) * cometOrbitRadius
    );
    cometPivot.rotation.y = -elapsedTime * 0.025;
  }

  if (cameraMove) {
    cameraMove.elapsed += delta;
    const t = Math.min(cameraMove.elapsed / cameraMove.duration, 1);
    const eased = t * t * (3 - 2 * t);

    camera.position.lerpVectors(cameraMove.fromCamera, cameraMove.toCamera, eased);
    controls.target.lerpVectors(cameraMove.fromTarget, cameraMove.toTarget, eased);

    if (t >= 1) cameraMove = null;
  }

  controls.update();
  renderer.render(scene, camera);
}

// ================================================
// RESPONSIVE RESIZE + WEBGL ERROR HANDLING
// ================================================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.15 : 1.5)
  );
});

renderer.domElement.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  if (errorBox) {
    errorBox.hidden = false;
    errorBox.textContent = "Graphics context হারিয়েছে। ব্রাউজার রিফ্রেশ করে আবার চেষ্টা করো।";
  }
});

window.addEventListener("error", (event) => {
  console.error("Application error:", event.message);
});

showObject("Sun");
if (status) status.textContent = "3D সৌরজগৎ প্রস্তুত";
animate();
