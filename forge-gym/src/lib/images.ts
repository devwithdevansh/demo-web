/**
 * CENTRALIZED IMAGE CONFIG
 * ------------------------
 * Every photo the site uses lives here. These are curated stock placeholders
 * (Unsplash) chosen for a dark, high-contrast, editorial grade — consistent
 * with section 40 of the brief (don't mix bright commercial shots with dark
 * cinematic ones). When real gym / trainer / member photography is ready,
 * replace the URLs below and nothing else in the codebase has to change.
 */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  heroVideo: '', // drop an mp4/webm path here to replace the hero still with cinematic video
  hero: u('photo-1517836357463-d25dfeac3438', 2000),

  statementBg: u('photo-1552674605-db6ffd4facb5', 1800),

  programs: {
    strength: u('photo-1534438327276-14e5300c3a48'),
    hypertrophy: u('photo-1571731956672-c8d8e3d4d9d4'),
    fatLoss: u('photo-1517963879433-6ad2b056d712'),
    functional: u('photo-1518611012118-696072aa579a'),
    crossfit: u('photo-1571019613454-1cb2f99b2d8b'),
    boxing: u('photo-1549719386-74dfcbf7dbed'),
    personal: u('photo-1571019613576-2b22c76fd955'),
  },

  trainingFloor: [
    u('photo-1534438327276-14e5300c3a48'),
    u('photo-1600271886742-f049cd451bba'),
    u('photo-1594737625785-a6cbdabd333c'),
    u('photo-1526506118085-60ce8714f8c5'),
    u('photo-1571008887538-b36bb32f4571'),
  ],

  equipment: {
    powerRacks: u('photo-1583454110551-21f2fa2afe61'),
    freeWeights: u('photo-1517964603305-4d1d7f9c4c2c'),
    cable: u('photo-1584735175315-9d5df23860e6'),
    cardio: u('photo-1540497077202-7c8a3999166f'),
    functional: u('photo-1583500178690-f7fd8b57e6f4'),
    recovery: u('photo-1591343395902-1c3752ba1b30'),
  },

  trainers: [
    { name: 'Alex Rey', role: 'Strength Coach', img: u('photo-1571019613454-1cb2f99b2d8b', 1200) },
    { name: 'Priya Nair', role: 'Fitness Coach', img: u('photo-1594381898411-846e7d193883', 1200) },
    { name: 'Rahul Mehta', role: 'Performance Coach', img: u('photo-1548690312-e3b507d8c110', 1200) },
    { name: 'Sara Kade', role: 'Conditioning Coach', img: u('photo-1517963879433-6ad2b056d712', 1200) },
  ],

  transformation: {
    before: u('photo-1571019613576-2b22c76fd955', 1200),
    after: u('photo-1517836357463-d25dfeac3438', 1200),
  },

  theBody: [
    u('photo-1571019613576-2b22c76fd955', 1800), // standing athlete
    u('photo-1534438327276-14e5300c3a48', 1800), // warm-up
    u('photo-1549719386-74dfcbf7dbed', 1800), // lifting
    u('photo-1517963879433-6ad2b056d712', 1800), // high intensity
    u('photo-1517836357463-d25dfeac3438', 1800), // final pose
  ],

  membershipBg: u('photo-1600271886742-f049cd451bba', 1800),

  classes: {
    strength: u('photo-1534438327276-14e5300c3a48', 900),
    hiit: u('photo-1517963879433-6ad2b056d712', 900),
    yoga: u('photo-1518611012118-696072aa579a', 900),
    boxing: u('photo-1549719386-74dfcbf7dbed', 900),
    crossfit: u('photo-1571019613454-1cb2f99b2d8b', 900),
    mobility: u('photo-1591343395902-1c3752ba1b30', 900),
  },

  community: [
    u('photo-1526506118085-60ce8714f8c5'),
    u('photo-1594737625785-a6cbdabd333c'),
    u('photo-1517963879433-6ad2b056d712'),
    u('photo-1600271886742-f049cd451bba'),
  ],

  recovery: u('photo-1591343395902-1c3752ba1b30', 1800),

  journal: [
    { title: 'How To Build Strength That Lasts', img: u('photo-1534438327276-14e5300c3a48', 1000) },
    { title: "Beginner's Training Guide", img: u('photo-1571008887538-b36bb32f4571', 1000) },
    { title: 'What To Eat After Training', img: u('photo-1547592180-85f173990554', 1000) },
    { title: 'Mobility For Athletes', img: u('photo-1518611012118-696072aa579a', 1000) },
  ],

  social: [
    u('photo-1534438327276-14e5300c3a48', 900),
    u('photo-1600271886742-f049cd451bba', 900),
    u('photo-1517963879433-6ad2b056d712', 900),
    u('photo-1571019613454-1cb2f99b2d8b', 900),
    u('photo-1594737625785-a6cbdabd333c', 900),
    u('photo-1526506118085-60ce8714f8c5', 900),
  ],

  finalCta: u('photo-1517836357463-d25dfeac3438', 2000),
};
