/**
 * Seed data for Fitness World.
 *   npx prisma db seed
 *
 * Everything here is SAMPLE content for layout and testing. Prices are
 * placeholders; testimonials are flagged `isSample` and render with a visible
 * "sample" label. Replace via the admin dashboard before launch.
 *
 * Re-running is safe: records are upserted by slug/title.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, type BillingCycle, type FitnessGoal, type MealSlot } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

const DAYS: Record<BillingCycle, number> = { MONTHLY: 30, QUARTERLY: 90, HALF_YEARLY: 180, ANNUAL: 365 };

// PLACEHOLDER prices in rupees — replace from /admin/plans.
const plans = [
  {
    slug: "regular-fitness",
    name: "Regular Fitness",
    tagline: "Full gym access and the guidance to use it well.",
    features: ["General gym access", "Access to regular workout equipment", "Standard workout guidance", "General fitness support"],
    includesPersonalTraining: false,
    isFeatured: false,
    sortOrder: 1,
    rupees: { MONTHLY: 1500, QUARTERLY: 4000, HALF_YEARLY: 7500, ANNUAL: 14000 },
  },
  {
    slug: "personal-training",
    name: "Personal Training",
    tagline: "A dedicated coach and a routine written for you.",
    features: ["Dedicated personal trainer", "Personalized workout routine", "Training progress monitoring", "Individual attention"],
    includesPersonalTraining: true,
    isFeatured: true,
    sortOrder: 2,
    rupees: { MONTHLY: 5000, QUARTERLY: 14000, HALF_YEARLY: 27000, ANNUAL: 50000 },
  },
  {
    slug: "premium-transformation",
    name: "Premium Transformation",
    tagline: "Training, nutrition and tracking working as one plan.",
    features: [
      "Premium gym membership",
      "Personal training support",
      "Customized workout planning",
      "Nutrition guidance",
      "Progress tracking",
    ],
    includesPersonalTraining: true,
    isFeatured: false,
    sortOrder: 3,
    rupees: { MONTHLY: 8000, QUARTERLY: 22000, HALF_YEARLY: 42000, ANNUAL: 80000 },
  },
] as const;

type MealSeed = {
  slug: string;
  name: string;
  slot: MealSlot;
  category: string;
  goals: FitnessGoal[];
  description: string;
  imageUrl: string;
  calories: number;
  proteinG: number;
  ingredients: string[];
};

// Nutrition values are APPROXIMATE estimates for a typical serving.
const meals: MealSeed[] = [
  { slug: "berry-overnight-oats", name: "Berry overnight oats", slot: "BREAKFAST", category: "breakfast", goals: ["GENERAL_FITNESS", "ENDURANCE", "WEIGHT_LOSS"], description: "Rolled oats soaked overnight in milk and curd, topped with fresh berries and kiwi.", imageUrl: u("1517673400267-0251440c45dc"), calories: 380, proteinG: 16, ingredients: ["Rolled oats", "Milk", "Curd", "Mixed berries", "Kiwi", "Chia seeds"] },
  { slug: "avocado-egg-toast", name: "Avocado egg toast", slot: "BREAKFAST", category: "breakfast", goals: ["MUSCLE_BUILDING", "GENERAL_FITNESS"], description: "Seeded sourdough, smashed avocado and two soft-boiled eggs.", imageUrl: u("1541519227354-08fa5d50c44d"), calories: 420, proteinG: 19, ingredients: ["Sourdough", "Avocado", "Eggs", "Lemon", "Chilli flakes"] },
  { slug: "protein-pancakes", name: "Banana protein pancakes", slot: "BREAKFAST", category: "breakfast", goals: ["MUSCLE_BUILDING", "STRENGTH"], description: "Oat and egg-white pancakes with banana and blueberries, a drizzle of honey.", imageUrl: u("1528207776546-365bb710ee93"), calories: 450, proteinG: 30, ingredients: ["Oat flour", "Egg whites", "Banana", "Blueberries", "Honey"] },
  { slug: "sunny-egg-toast", name: "Sunny-side egg toast", slot: "BREAKFAST", category: "breakfast", goals: ["GENERAL_FITNESS"], description: "A fried egg on wholegrain toast with greens. Quick, filling, done in five minutes.", imageUrl: u("1525351484163-7529414344d8"), calories: 310, proteinG: 14, ingredients: ["Wholegrain bread", "Egg", "Spinach", "Olive oil"] },
  { slug: "greek-yogurt-cups", name: "Greek yogurt berry cups", slot: "MID_MORNING", category: "snacks", goals: ["WEIGHT_LOSS", "MUSCLE_BUILDING"], description: "Thick hung curd layered with strawberries. High protein, low effort.", imageUrl: u("1488477181946-6428a0291777"), calories: 210, proteinG: 18, ingredients: ["Hung curd / Greek yogurt", "Strawberries", "Honey"] },
  { slug: "almond-handful", name: "A handful of almonds", slot: "MID_MORNING", category: "snacks", goals: ["GENERAL_FITNESS", "ENDURANCE"], description: "About 25 almonds. Healthy fats and steady energy between meals.", imageUrl: u("1508061253366-f7da158b6d46"), calories: 170, proteinG: 6, ingredients: ["Almonds"] },
  { slug: "fresh-fruit-bowl", name: "Fresh fruit bowl", slot: "MID_MORNING", category: "weight-loss", goals: ["WEIGHT_LOSS", "GENERAL_FITNESS"], description: "Seasonal fruit with a squeeze of lime and mint.", imageUrl: u("1490474418585-ba9bad8fd0ea"), calories: 160, proteinG: 2, ingredients: ["Seasonal fruit", "Lime", "Mint"] },
  { slug: "grilled-chicken-plate", name: "Grilled chicken & greens", slot: "LUNCH", category: "protein", goals: ["MUSCLE_BUILDING", "STRENGTH", "WEIGHT_LOSS"], description: "Herb-marinated chicken breast with sautéed peas, carrots and beans.", imageUrl: u("1598515214211-89d3c73ae83b"), calories: 520, proteinG: 46, ingredients: ["Chicken breast", "Peas", "Carrot", "Green beans", "Garlic", "Herbs"] },
  { slug: "dal-roti-thali", name: "Balanced dal-roti thali", slot: "LUNCH", category: "muscle", goals: ["GENERAL_FITNESS", "MUSCLE_BUILDING"], description: "Dal, sabzi, two rotis and curd. Home food, sensibly portioned.", imageUrl: u("1546833999-b9f581a1996d"), calories: 560, proteinG: 22, ingredients: ["Toor dal", "Seasonal sabzi", "Whole-wheat roti", "Curd", "Salad"] },
  { slug: "chickpea-power-bowl", name: "Chickpea power bowl", slot: "LUNCH", category: "weight-loss", goals: ["WEIGHT_LOSS", "ENDURANCE"], description: "Spiced chickpeas, quinoa, avocado and crunchy vegetables.", imageUrl: u("1623428187969-5da2dcea5ebf"), calories: 480, proteinG: 19, ingredients: ["Chickpeas", "Quinoa", "Avocado", "Tomato", "Spinach", "Lemon-tahini dressing"] },
  { slug: "salmon-rainbow-bowl", name: "Salmon rainbow bowl", slot: "LUNCH", category: "protein", goals: ["MUSCLE_BUILDING", "TRANSFORMATION"], description: "Seared salmon with boiled egg, sweetcorn, cabbage and cucumber.", imageUrl: u("1546069901-ba9599a7e63c"), calories: 560, proteinG: 38, ingredients: ["Salmon", "Egg", "Sweetcorn", "Red cabbage", "Cucumber", "Brown rice"] },
  { slug: "tofu-crunch-bowl", name: "Tofu crunch bowl", slot: "LUNCH", category: "protein", goals: ["WEIGHT_LOSS", "GENERAL_FITNESS"], description: "Pan-seared tofu, edamame and raw vegetables over greens.", imageUrl: u("1546069901-d5bfd2cbfb1f"), calories: 450, proteinG: 27, ingredients: ["Firm tofu", "Edamame", "Red cabbage", "Cucumber", "Sesame dressing"] },
  { slug: "roasted-chickpeas", name: "Roasted masala chickpeas", slot: "EVENING_SNACK", category: "snacks", goals: ["WEIGHT_LOSS", "GENERAL_FITNESS"], description: "Crunchy oven-roasted chickpeas with chaat masala.", imageUrl: u("1515543904379-3d757afe72e4"), calories: 180, proteinG: 9, ingredients: ["Boiled chickpeas", "Chaat masala", "Olive oil"] },
  { slug: "green-smoothie", name: "Green apple smoothie", slot: "EVENING_SNACK", category: "weight-loss", goals: ["WEIGHT_LOSS", "ENDURANCE"], description: "Spinach, green apple, cucumber and mint blended cold.", imageUrl: u("1610970881699-44a5587cabec"), calories: 150, proteinG: 4, ingredients: ["Spinach", "Green apple", "Cucumber", "Mint", "Lime"] },
  { slug: "eggs-and-spinach", name: "Boiled eggs on spinach", slot: "EVENING_SNACK", category: "protein", goals: ["MUSCLE_BUILDING", "WEIGHT_LOSS"], description: "Two boiled eggs over wilted spinach with black pepper.", imageUrl: u("1482049016688-2d3e1b311543"), calories: 200, proteinG: 14, ingredients: ["Eggs", "Spinach", "Black pepper"] },
  { slug: "paneer-tikka-plate", name: "Paneer tikka plate", slot: "DINNER", category: "muscle", goals: ["MUSCLE_BUILDING", "STRENGTH"], description: "Tandoor-style paneer and peppers with mint chutney.", imageUrl: u("1604908176997-125f25cc6f3d"), calories: 430, proteinG: 26, ingredients: ["Paneer", "Bell peppers", "Onion", "Hung curd marinade", "Mint chutney"] },
  { slug: "salmon-and-greens", name: "Salmon with herb greens", slot: "DINNER", category: "protein", goals: ["TRANSFORMATION", "WEIGHT_LOSS"], description: "Baked salmon fillet over sautéed greens and fresh salsa.", imageUrl: u("1467003909585-2f8a72700288"), calories: 480, proteinG: 36, ingredients: ["Salmon", "Spinach", "Tomato salsa", "Lemon", "Olive oil"] },
  { slug: "lemon-herb-chicken", name: "Lemon herb chicken", slot: "DINNER", category: "muscle", goals: ["MUSCLE_BUILDING", "STRENGTH", "TRANSFORMATION"], description: "Grilled chicken with lemon, rosemary and charred vegetables.", imageUrl: u("1532550907401-a500c9a57435"), calories: 450, proteinG: 42, ingredients: ["Chicken thigh", "Lemon", "Rosemary", "Peppers", "Carrot"] },
  { slug: "veg-grain-bowl", name: "Garden grain bowl", slot: "DINNER", category: "weight-loss", goals: ["WEIGHT_LOSS", "GENERAL_FITNESS"], description: "Brown rice, seasoned vegetables and a soft egg.", imageUrl: u("1609501676725-7186f017a4b7"), calories: 470, proteinG: 20, ingredients: ["Brown rice", "Carrot", "Spinach", "Bean sprouts", "Egg", "Sesame"] },
];

const testimonials = [
  { clientName: "Sample member", program: "Muscle Building", durationLabel: "Sample story", quote: "This is a sample testimonial used for layout. Real member stories appear here once they are added with the member's consent.", sortOrder: 1 },
  { clientName: "Sample member", program: "Fat Loss & Conditioning", durationLabel: "Sample story", quote: "Sample text: a short quote about how coaching, structure and consistency changed a member's training.", sortOrder: 2 },
  { clientName: "Sample member", program: "Personal Training", durationLabel: "Sample story", quote: "Sample text: replace this card from the admin dashboard with a verified member story and before/after photos.", sortOrder: 3 },
];

const content = [
  { kind: "VIDEO", title: "Back squat: setup to lockout", summary: "Bracing, foot pressure and bar path for a stronger, safer squat.", category: "Strength", durationMin: 1, videoUrl: "https://videos.pexels.com/video-files/5319759/5319759-hd_1280_720_25fps.mp4", thumbnailUrl: u("1574680096145-d05b474e2155"), isPreview: true },
  { kind: "TUTORIAL", title: "The perfect push-up", summary: "Hand position, body line and tempo. Then three progressions.", category: "Bodyweight", durationMin: 1, videoUrl: "https://videos.pexels.com/video-files/4367576/4367576-sd_960_540_30fps.mp4", thumbnailUrl: u("1571019614242-c5c5dee9f50b"), isPreview: false },
  { kind: "CHALLENGE", title: "30-day consistency challenge", summary: "Train, walk or stretch every day for 30 days. Log it in your progress tracker.", category: "Challenges", thumbnailUrl: u("1552674605-db6ffd4facb5"), body: "Show up every day for 30 days. Any movement counts: a full session, a 30-minute walk or 15 minutes of mobility. Log each day in your Progress Tracker.", isPreview: true },
  { kind: "TIP", title: "Progressive overload, simply", summary: "Add a rep, add a little weight, or slow the tempo. Pick one each week.", category: "Strength", thumbnailUrl: u("1517836357463-d25dfeac3438"), body: "Progress comes from doing slightly more over time. Each week, pick one lever: one more rep per set, a small load increase, or a slower lowering phase.", isPreview: false },
  { kind: "ARTICLE", title: "Sleep is a training tool", summary: "Why recovery decides how much of your training actually sticks.", category: "Recovery", thumbnailUrl: u("1605296867304-46d5465a13f1"), body: "Training breaks you down; recovery builds you back. Aim for a consistent sleep window, keep the room dark and cool, and keep late caffeine to a minimum.", isPreview: false },
  { kind: "MOTIVATION", title: "Discipline beats motivation", summary: "Motivation comes and goes. Systems keep you training when it fades.", category: "Mindset", thumbnailUrl: u("1594381898411-846e7d193883"), body: "Decide your training days in advance, pack your bag the night before, and make the first step tiny. Show up first; motivation follows.", isPreview: false },
] as const;

const workoutPlans = [
  {
    title: "Foundation strength — 3 days",
    summary: "Full-body sessions built around the main lifts. Ideal for your first 8 weeks.",
    goal: "STRENGTH",
    level: "Beginner",
    days: [
      { day: "Day 1 — Full body A", exercises: [{ name: "Goblet squat", sets: 3, reps: "10" }, { name: "Dumbbell bench press", sets: 3, reps: "10" }, { name: "Seated cable row", sets: 3, reps: "12" }, { name: "Plank", sets: 3, reps: "30s" }] },
      { day: "Day 2 — Full body B", exercises: [{ name: "Romanian deadlift", sets: 3, reps: "10" }, { name: "Overhead press", sets: 3, reps: "8" }, { name: "Lat pulldown", sets: 3, reps: "12" }, { name: "Walking lunge", sets: 2, reps: "12 each" }] },
      { day: "Day 3 — Full body C", exercises: [{ name: "Back squat", sets: 4, reps: "6" }, { name: "Push-up", sets: 3, reps: "AMRAP" }, { name: "Single-arm row", sets: 3, reps: "10 each" }, { name: "Farmer carry", sets: 3, reps: "30m" }] },
    ],
  },
  {
    title: "Hypertrophy split — 4 days",
    summary: "Upper/lower split with higher volume for muscle growth.",
    goal: "MUSCLE_BUILDING",
    level: "Intermediate",
    days: [
      { day: "Day 1 — Upper", exercises: [{ name: "Incline dumbbell press", sets: 4, reps: "8–10" }, { name: "Chest-supported row", sets: 4, reps: "10" }, { name: "Lateral raise", sets: 3, reps: "15" }, { name: "Cable curl", sets: 3, reps: "12" }] },
      { day: "Day 2 — Lower", exercises: [{ name: "Back squat", sets: 4, reps: "8" }, { name: "Leg press", sets: 3, reps: "12" }, { name: "Leg curl", sets: 3, reps: "12" }, { name: "Calf raise", sets: 4, reps: "15" }] },
      { day: "Day 3 — Upper", exercises: [{ name: "Bench press", sets: 4, reps: "6–8" }, { name: "Pull-up", sets: 4, reps: "AMRAP" }, { name: "Seated dumbbell press", sets: 3, reps: "10" }, { name: "Triceps pushdown", sets: 3, reps: "12" }] },
      { day: "Day 4 — Lower", exercises: [{ name: "Romanian deadlift", sets: 4, reps: "8" }, { name: "Bulgarian split squat", sets: 3, reps: "10 each" }, { name: "Hip thrust", sets: 3, reps: "10" }, { name: "Hanging knee raise", sets: 3, reps: "12" }] },
    ],
  },
  {
    title: "Fat-loss conditioning — 3 days",
    summary: "Strength circuits plus intervals to raise work capacity.",
    goal: "WEIGHT_LOSS",
    level: "All levels",
    days: [
      { day: "Day 1 — Circuit", exercises: [{ name: "Kettlebell swing", sets: 4, reps: "15" }, { name: "Push-up", sets: 4, reps: "10" }, { name: "Goblet squat", sets: 4, reps: "12" }, { name: "Rower", sets: 4, reps: "250m" }] },
      { day: "Day 2 — Intervals", exercises: [{ name: "Bike sprints", sets: 8, reps: "20s on / 40s off" }, { name: "Battle ropes", sets: 4, reps: "30s" }, { name: "Dead bug", sets: 3, reps: "10 each" }] },
      { day: "Day 3 — Strength + finisher", exercises: [{ name: "Trap-bar deadlift", sets: 4, reps: "6" }, { name: "Dumbbell row", sets: 3, reps: "10" }, { name: "Sled push", sets: 5, reps: "20m" }] },
    ],
  },
] as const;

async function main() {
  for (const p of plans) {
    const { rupees, ...data } = p;
    const plan = await prisma.membershipPlan.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, features: [...data.features] },
    });
    for (const cycle of Object.keys(rupees) as BillingCycle[]) {
      await prisma.planPrice.upsert({
        where: { planId_cycle: { planId: plan.id, cycle } },
        update: {},
        create: { planId: plan.id, cycle, amountPaise: rupees[cycle] * 100, durationDays: DAYS[cycle] },
      });
    }
  }

  for (const [i, m] of meals.entries()) {
    await prisma.meal.upsert({ where: { slug: m.slug }, update: {}, create: { ...m, sortOrder: i } });
  }

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: testimonials.map((t) => ({ ...t, isSample: true, isPublished: true })),
    });
  }

  if ((await prisma.contentItem.count()) === 0) {
    await prisma.contentItem.createMany({ data: content.map((c) => ({ ...c })) });
  }

  if ((await prisma.workoutPlan.count({ where: { userId: null } })) === 0) {
    for (const w of workoutPlans) {
      await prisma.workoutPlan.create({ data: { ...w, days: w.days as unknown as object } });
    }
  }

  if ((await prisma.announcement.count()) === 0) {
    await prisma.announcement.create({
      data: {
        title: "Welcome to The Inner Circle",
        body: "This is where new workouts, challenges and gym news land first. (Sample announcement — edit or remove from the admin dashboard.)",
        isPinned: true,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
      create: {
        email: adminEmail,
        name: "Administrator",
        phone: "",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(adminPassword, 12),
      },
    });
    console.log(`Admin ready: ${adminEmail}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipped admin user.");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
