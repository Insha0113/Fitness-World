/**
 * Stock media (Unsplash / Pexels, free licenses). Swap any URL for the gym's
 * own photography or video — every image on the site is referenced from here.
 */

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const media = {
  heroVideo: {
    desktop: "https://videos.pexels.com/video-files/5319759/5319759-hd_1280_720_25fps.mp4",
    mobile: "https://videos.pexels.com/video-files/5319759/5319759-sd_640_360_25fps.mp4",
    poster: u("1605296867304-46d5465a13f1"),
  },
  pushupVideo: "https://videos.pexels.com/video-files/4367576/4367576-sd_960_540_30fps.mp4",

  gym: {
    floor: u("1534438327276-14e5300c3a48"),
    coaching: u("1571019614242-c5c5dee9f50b"),
    deadlift: u("1517836357463-d25dfeac3438"),
    dumbbells: u("1583454110551-21f2fa2afe61"),
    ropes: u("1599058917212-d750089bc07e"),
    curl: u("1581009146145-b5ef050c2e1e"),
    rackWoman: u("1541534741688-6078c6bfb5c5"),
    squatMono: u("1574680096145-d05b474e2155"),
    darkLift: u("1605296867304-46d5465a13f1"),
    barbellFloor: u("1517963879433-6ad2b056d712"),
    torso: u("1526506118085-60ce8714f8c5"),
    grip: u("1549060279-7e168fcee0c2"),
    athlete: u("1594381898411-846e7d193883"),
    running: u("1552674605-db6ffd4facb5"),
  },

  food: {
    veggiePlate: u("1512621776951-a57141f2eefd"),
    salmonBowl: u("1546069901-ba9599a7e63c"),
    eggBowl: u("1490645935967-10de6ba17061"),
    steakSpread: u("1504674900247-0877df9cc836"),
    lightSalad: u("1543339308-43e59d6b73a6"),
    pomegranateSalad: u("1511690743698-d9d85f2fbf38"),
    eggToast: u("1525351484163-7529414344d8"),
    grainBowl: u("1547592180-85f173990554"),
    darkSalad: u("1540189549336-e6e99c3679fe"),
    frenchToast: u("1484723091739-30a097e8f929"),
    breakfastSpread: u("1494390248081-4e521a5940db"),
    jarSalad: u("1505576399279-565b52d4ac71"),
    fruitBowl: u("1490474418585-ba9bad8fd0ea"),
    water: u("1548839140-29a749e1cf4d"),
    cherries: u("1559181567-c3190ca9959b"),
    salmonPlate: u("1467003909585-2f8a72700288"),
  },
} as const;

/** Build a sized Unsplash URL (next/image also resizes; this keeps the origin fetch small). */
export function img(url: string, w = 1600) {
  return url.includes("unsplash.com") ? `${url}?auto=format&fit=crop&w=${w}&q=75` : url;
}
