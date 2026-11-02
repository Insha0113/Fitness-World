import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { getPublishedMeals } from "@/lib/content";
import { img, media } from "@/config/media";
import { MealPlanner, MealSection, SavedProvider } from "@/components/fuel/FuelStudio";
import type { SaveState } from "@/components/fuel/MealCard";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "The Fuel Studio",
  description: "Eat well. Feel unstoppable. Meal ideas, protein-rich recipes and nutrition habits from Fitness World.",
};

const sections = [
  { id: "breakfast", title: "Healthy breakfast ideas", lede: "Start the day with protein, fibre and something you actually look forward to." },
  { id: "protein", title: "Protein-rich meals", lede: "Hit your protein without eating the same chicken breast every day." },
  { id: "muscle", title: "Muscle-building nutrition", lede: "Enough energy to train hard and recover well. Home food counts." },
  { id: "weight-loss", title: "Weight-loss meals", lede: "Filling, colourful and lighter on calories. Volume without the hunger." },
  { id: "snacks", title: "Healthy snacks", lede: "Small, smart bites to bridge the gap between meals." },
];

const tips = [
  { title: "Protein at every meal", body: "Spread it across the day: eggs, dal, paneer, curd, chicken, fish or tofu." },
  { title: "Half the plate, plants", body: "Vegetables and fruit add volume, fibre and micronutrients for very few calories." },
  { title: "Plan the week, not the meal", body: "Decide three go-to breakfasts and lunches. Fewer decisions, fewer slips." },
  { title: "Don't drink your calories", body: "Sweetened drinks add up quickly. Water, buttermilk and black coffee are your friends." },
];

export default async function FuelStudioPage() {
  const session = await getSession();
  const [meals, saved] = await Promise.all([
    getPublishedMeals(),
    session?.user?.id
      ? prisma.savedMeal.findMany({ where: { userId: session.user.id }, select: { mealId: true } })
      : Promise.resolve([]),
  ]);
  const saveState: SaveState = !session ? "guest" : session.user.membershipStatus === "ACTIVE" ? "member" : "inactive";
  const view = meals.map((m) => ({
    id: m.id,
    name: m.name,
    slot: m.slot,
    category: m.category,
    goals: m.goals,
    description: m.description,
    imageUrl: m.imageUrl,
    calories: m.calories,
    proteinG: m.proteinG,
    ingredients: m.ingredients,
    isVerified: m.isVerified,
  }));

  return (
    <div className="theme-fuel">
      <SavedProvider initial={saved.map((s) => s.mealId)}>
        {/* Hero: editorial split, food photography doing the work */}
        <section className="relative overflow-hidden pb-16 pt-28 lg:pb-24 lg:pt-36">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-10">
            <div className="lg:col-span-6">
              <p className="font-serif text-xl italic text-olive">The Fuel Studio</p>
              <h1 className="mt-4 font-serif text-[clamp(3.4rem,8vw,7rem)] font-normal leading-[0.95] tracking-tight text-earth [font-variation-settings:'SOFT'_100,'opsz'_144]">
                Eat well. Feel unstoppable.
              </h1>
              <p className="mt-6 max-w-[44ch] text-lg text-earth/70">
                Real food that supports real training. Browse meals for every goal, build a sample day and save the ones
                you love.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#planner" className={buttonClass("fuel", "lg")}>
                  Plan my meals
                </a>
                <a href="#breakfast" className={buttonClass("fuel-outline", "lg")}>
                  Browse recipes
                </a>
              </div>
            </div>
            <div className="relative h-[460px] sm:h-[560px] lg:col-span-6">
              <div className="absolute right-0 top-0 h-[78%] w-[72%] overflow-hidden rounded-[40px]">
                <Image src={img(media.food.salmonBowl, 1200)} alt="Salmon rainbow bowl with egg, corn and vegetables" fill priority sizes="(min-width: 1024px) 36vw, 72vw" className="object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 h-[52%] w-[48%] overflow-hidden rounded-[32px] ring-8 ring-cream">
                <Image src={img(media.food.eggToast, 800)} alt="Fried egg on wholegrain toast" fill sizes="(min-width: 1024px) 24vw, 48vw" className="object-cover" />
              </div>
              <div aria-hidden className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-peach/70 blur-2xl" />
            </div>
          </div>
        </section>

        <nav aria-label="Fuel Studio sections" className="sticky top-[72px] z-30 border-y border-earth/10 bg-cream/90 backdrop-blur">
          <ul className="mx-auto flex max-w-[1320px] gap-6 overflow-x-auto px-4 py-3 text-sm [scrollbar-width:none] sm:px-6 lg:px-10">
            {[...sections, { id: "hydration", title: "Hydration" }, { id: "tips", title: "Nutrition tips" }, { id: "planner", title: "Meal planner" }].map((s) => (
              <li key={s.id} className="shrink-0">
                <a href={`#${s.id}`} className="text-earth/70 hover:text-sage-deep">
                  {s.title.replace(/^Healthy (\w)/, (_, c: string) => c.toUpperCase())}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {sections.map((s, i) => (
          <div key={s.id} className={i % 2 ? "bg-oat/60" : ""}>
            <MealSection id={s.id} title={s.title} lede={s.lede} meals={view.filter((m) => m.category === s.id)} saveState={saveState} />
          </div>
        ))}

        <section id="hydration" aria-labelledby="hydration-title" className="scroll-mt-24 bg-sage/25 py-20 lg:py-28">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[36px]">
              <Image src={img(media.food.water, 1200)} alt="Water pouring into a glass" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <h2 id="hydration-title" className="font-serif text-[clamp(2.2rem,4.4vw,3.6rem)] font-medium leading-[1.05] tracking-tight text-earth">
                Hydration
              </h2>
              <p className="mt-4 text-lg text-earth/75">
                Even mild dehydration makes training feel harder. Keep a bottle with you, sip through your session, and
                drink more on hot days or long workouts.
              </p>
              <ul className="mt-6 space-y-3 text-earth/80">
                <li>Start the day with a glass of water before tea or coffee.</li>
                <li>Pale yellow urine is a simple sign you&apos;re on track.</li>
                <li>Coconut water, buttermilk and nimbu pani count, too.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="tips" aria-labelledby="tips-title" className="scroll-mt-24 py-20 lg:py-28">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <h2 id="tips-title" className="font-serif text-[clamp(2.2rem,4.4vw,3.6rem)] font-medium leading-[1.05] tracking-tight text-earth">
              Nutrition tips that stick
            </h2>
            <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {tips.map((t) => (
                <div key={t.title} className="border-t-2 border-sage pt-5">
                  <dt className="font-serif text-xl font-medium text-earth">{t.title}</dt>
                  <dd className="mt-2 text-earth/70">{t.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="planner" aria-labelledby="planner-title" className="scroll-mt-24 bg-oat/70 py-20 lg:py-28">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <h2 id="planner-title" className="font-serif text-[clamp(2.4rem,5vw,4.2rem)] font-medium leading-[1.02] tracking-tight text-earth">
              Personalised meal planning
            </h2>
            <p className="mb-8 mt-3 max-w-[56ch] text-lg text-earth/70">
              Choose your goal to see a sample day. Swap anything you don&apos;t fancy, and save meals to your plan.
            </p>
            <MealPlanner meals={view} saveState={saveState} />

            <aside className="mt-14 rounded-[28px] bg-cream p-6 text-sm text-earth/75 ring-1 ring-earth/10 sm:p-8">
              <p className="font-semibold text-earth">Please read</p>
              <p className="mt-2">
                Meal ideas and nutrition values on this page are general, approximate guidance for healthy adults. They
                are not medical advice and are not a substitute for a consultation with a registered dietitian or doctor.
                If you have a medical condition, allergy, are pregnant or take medication, speak to a qualified
                professional before changing your diet. Personalised plans offered as part of a membership are reviewed
                by a qualified nutrition professional.
              </p>
              <Link href="/consultation?intent=CONSULTATION&program=personal-training" className="mt-4 inline-block font-medium text-sage-deep underline">
                Ask about nutrition guidance with a coach
              </Link>
            </aside>
          </div>
        </section>
      </SavedProvider>
    </div>
  );
}
