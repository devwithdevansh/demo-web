Create an award-level, highly interactive ELITE FITNESS CLUB website.

IMPORTANT:

This website must NOT follow the normal modern website structure of:

Hero → cards → services → trainers → pricing → footer.

Instead, build the website as a CINEMATIC INTERACTIVE FITNESS EXPERIENCE.

The website should feel like the user is controlling a sports film through scrolling.

PRIMARY EXPERIENCE:

SCROLL = CAMERA CONTROL

SCROLL = VIDEO CONTROL

SCROLL = TRANSFORMATION

SCROLL = STORY

The website should combine:

- scroll-controlled video
- frame-by-frame image sequences
- pinned storytelling sections
- horizontal scrolling
- kinetic typography
- cinematic transitions
- image masking
- video scrubbing
- parallax
- interactive before/after
- cursor interactions
- fullscreen sections
- progressive transformation
- subtle sound-ready architecture
- mobile-specific motion

Reference quality:

Equinox
+
Elite Fitness Club
+
Awwwards
+
CSS Design Awards
+
CSS Winner
+
FWA

Do not copy their designs.

Use them only for art direction, UX quality and interaction inspiration.

==================================================
1. CORE CREATIVE IDEA
==================================================

The entire website tells one story:

FROM:

"I WANT TO GET FIT"

TO:

"I AM BECOMING STRONGER."

The user enters the website.

Then:

ATHLETE APPEARS

↓

ATHLETE STARTS MOVING

↓

TRAINING BEGINS

↓

INTENSITY INCREASES

↓

BODY TRANSFORMS

↓

COMMUNITY APPEARS

↓

RECOVERY

↓

FINAL RESULT

↓

JOIN THE CLUB

The website should feel like a 60–90 second cinematic fitness campaign controlled by the user's scrolling.

==================================================
2. VISUAL DIRECTION
==================================================

Use a completely different visual language from the luxury salon and automotive websites.

GYM STYLE:

RAW
ATHLETIC
KINETIC
BOLD
DARK
ENERGETIC
DISCIPLINED
PRECISE

Color system:

BLACK
WHITE
GRAPHITE

ONE ACCENT:

ELECTRIC RED

Use red only for:

- active states
- progress indicators
- important numbers
- CTA
- small highlights

Do NOT create a generic red-and-black gym template.

==================================================
3. TYPOGRAPHY
==================================================

Use a heavy condensed athletic typeface.

Typography references:

sports campaigns
editorial magazines
performance brands
boxing posters
athletic apparel campaigns

Use:

ULTRA-BOLD CONDENSED DISPLAY FONT

+

clean grotesk sans-serif

+

small technical monospace text.

Example:

TRAIN
HARDER.

Then:

BECOME
STRONGER.

Then:

NO
LIMITS.

Typography should behave like part of the animation.

Letters can:

- stretch
- slide
- crop
- scale
- overlap
- move horizontally
- disappear behind images

Do not animate every letter randomly.

==================================================
4. INTRO LOADING EXPERIENCE
==================================================

Do NOT use a normal loading spinner.

Create:

BLACK SCREEN

Centered:

ELITE

FITNESS CLUB

Below:

PREPARING YOUR SESSION

A small horizontal line progresses:

00 ━━━━━ 100

Then the first frame of the hero video appears.

Transition:

black → athlete silhouette → full image.

Keep the loading experience extremely short.

==================================================
5. HERO — SCROLL CONTROLLED VIDEO
==================================================

THIS IS THE MOST IMPORTANT SECTION.

Do not use a normal autoplay hero video.

Create a VIDEO SCRUBBING HERO.

Use a 5–8 second cinematic workout video.

Example:

An athlete stands in a dark gym.

The athlete prepares for a heavy lift.

Chalk is applied.

Hands grip the bar.

Athlete pulls.

Weight rises.

Camera moves.

Athlete completes the rep.

The video itself does NOT automatically play.

Instead:

USER SCROLLS DOWN
→
VIDEO PLAYS FORWARD.

USER SCROLLS UP
→
VIDEO PLAYS BACKWARD.

The scroll position controls the video's currentTime.

This should feel like:

SCROLL = VIDEO TIMELINE.

Hero text:

TRAIN
BEYOND
LIMITS.

Text should be integrated into the video composition.

At the beginning:

TRAIN

During the middle:

BEYOND

At the final frame:

LIMITS.

==================================================
6. HERO FRAME-BASED FALLBACK
==================================================

If browser video scrubbing is not smooth enough:

Use an image sequence.

Generate approximately:

120–180 frames.

Example:

frame_001.webp
frame_002.webp
frame_003.webp
...
frame_180.webp

As the user scrolls:

frame = scrollProgress × totalFrames

The athlete movement becomes completely controlled by scrolling.

Use:

requestAnimationFrame

and preload the first frames.

Use lower-resolution mobile frames.

This should create an Apple-style scroll storytelling experience.

==================================================
7. HERO CAMERA EFFECT
==================================================

As the user scrolls through the hero:

0%:

wide shot

25%:

camera moves closer

50%:

athlete fills screen

75%:

extreme close-up

100%:

final powerful pose

Use either:

video camera movement

OR

image-sequence camera simulation.

Do NOT simply scale one image.

The camera angle should actually change through the frames.

==================================================
8. HERO PROGRESS INDICATOR
==================================================

Add a small vertical indicator on the right.

Example:

SESSION

01 ━━━━━━━

02

03

04

As scrolling progresses:

progress line grows.

Small label:

SCROLL TO TRAIN

The indicator should remain minimal.

==================================================
9. TRANSITION FROM HERO
==================================================

At 100% hero progress:

Do NOT immediately reveal a normal section.

Freeze the final video frame.

Then:

frame expands slightly

↓

screen turns black

↓

giant typography appears:

DISCIPLINE
IS BUILT.

↓

next scene begins.

This creates a cinematic chapter transition.

==================================================
10. CHAPTER SYSTEM
==================================================

Divide the entire website into cinematic chapters.

CHAPTER 01
THE MIND

CHAPTER 02
THE BODY

CHAPTER 03
THE WORK

CHAPTER 04
THE PEOPLE

CHAPTER 05
THE RESULT

CHAPTER 06
THE CLUB

Display the chapter number subtly.

Example:

01 / THE MIND

This makes the website feel like an interactive film.

==================================================
11. CHAPTER 01 — THE MIND
==================================================

Background:

pure black.

No photography initially.

Large typography:

YOU DON'T
NEED
MOTIVATION.

Pause.

Then scroll:

YOU NEED
DISCIPLINE.

The typography should change scale dramatically.

First:

YOU DON'T

Then:

NEED

Then:

MOTIVATION.

Then everything disappears.

Final statement:

DISCIPLINE.

Huge.

The word should move horizontally across the viewport.

==================================================
12. CHAPTER 02 — THE BODY
==================================================

Use a sequence of 3–5 athlete images.

Instead of normal scrolling:

PIN THE SECTION.

The section remains fixed.

Scrolling changes the image.

IMAGE 01:

standing athlete

IMAGE 02:

warm-up

IMAGE 03:

lifting

IMAGE 04:

high intensity

IMAGE 05:

final pose

At the same time:

BODY
POWER
CONTROL
ENDURANCE

appear one after another.

This creates:

SCROLL → FRAME CHANGE.

==================================================
13. TRAINING PROGRAMS — FRAME CAROUSEL
==================================================

Do not use cards.

Create one giant viewport.

LEFT:

01
STRENGTH

RIGHT:

full-screen athlete video/image.

Scroll:

STRENGTH
→
HYPERTROPHY
→
FAT LOSS
→
FUNCTIONAL
→
BOXING
→
PERSONAL TRAINING

Each scroll position changes:

- image
- title
- description
- accent
- small technical information.

Use a vertical progress indicator.

==================================================
14. SCROLL CONTROLLED TRAINING VIDEO
==================================================

Create a second scroll-controlled video.

Video:

athlete performing a deadlift.

As user scrolls:

0%:
approaches bar

20%:
grips bar

40%:
starts lift

60%:
bar rises

80%:
standing position

100%:
final lockout

Overlay technical labels:

FORM
POWER
CONTROL

The labels appear at exact moments in the video.

This should feel like a sports-analysis interface.

==================================================
15. GYM TOUR — HORIZONTAL FILM
==================================================

Create a pinned 100vh section.

User scrolls vertically.

Content moves horizontally.

Sequence:

ENTRANCE

↓

TRAINING FLOOR

↓

STRENGTH ZONE

↓

CARDIO

↓

FUNCTIONAL AREA

↓

BOXING

↓

RECOVERY

Each location uses a full-screen photograph or short video.

At the bottom:

01 / 06
02 / 06
03 / 06

etc.

The horizontal movement should be smooth and cinematic.

==================================================
16. EQUIPMENT — MACRO FRAME SEQUENCE
==================================================

Instead of showing equipment cards:

Show a rapid sequence.

FRAME 01:

weight plate

FRAME 02:

barbell

FRAME 03:

rack

FRAME 04:

dumbbell

FRAME 05:

cable

FRAME 06:

machine

As user scrolls:

the equipment appears almost like a fashion editorial.

Typography:

BUILT
FOR
PERFORMANCE.

Small technical specifications appear.

==================================================
17. TRAINER SECTION — MOVING PORTRAITS
==================================================

Do not create profile cards.

Show giant portrait.

Name:

ALEX

STRENGTH COACH

When scrolling:

portrait changes.

Next:

PRIYA

PERFORMANCE COACH

Next:

RAHUL

FITNESS COACH

The transition should be:

portrait slides horizontally

old portrait exits

new portrait enters

Typography remains fixed.

This creates a fashion/editorial casting experience.

==================================================
18. TRAINER CURSOR INTERACTION
==================================================

Desktop:

Show trainer names vertically.

Example:

ALEX
PRIYA
RAHUL
NEHA

When hovering:

large portrait appears behind the cursor.

Cursor contains:

MEET

When moving to another name:

image changes immediately.

No cards.

No borders.

==================================================
19. TRANSFORMATION — VIDEO BEFORE/AFTER
==================================================

Create a transformation section.

Instead of just using two images:

Use synchronized video/image sequences.

LEFT:

BEFORE

RIGHT:

AFTER

As the user scrolls:

the transformation progresses.

Example:

BEFORE:

beginner

AFTER:

trained athlete.

Use:

mask reveal
+
video/image sequence.

At 50%:

half transformation.

At 100%:

complete transformation.

Then:

12 MONTHS

appears.

Only use real transformation data.

==================================================
20. PERFORMANCE DATA
==================================================

After transformation:

screen becomes minimal black.

Huge numbers animate into view.

Example:

5000+

WORKOUTS

120+

MEMBERS

15+

COACHES

7

DAYS / WEEK

Numbers should count upward once.

Use GSAP ScrollTrigger.

Do NOT continuously loop the numbers.

==================================================
21. MEMBERSHIP — SCROLL THROUGH LEVELS
==================================================

No normal pricing cards.

Create:

CHOOSE
YOUR
LEVEL.

Then three large states.

01
CORE

02
PRO

03
ELITE

Scroll controls the transition.

CORE slides away.

PRO enters.

ELITE enters.

Each level reveals its benefits.

At ELITE:

button appears:

START YOUR MEMBERSHIP →

==================================================
22. CLASS SCHEDULE
==================================================

This section should intentionally become more functional.

Do not over-animate the schedule.

Show:

MON
TUE
WED
THU
FRI
SAT
SUN

Classes:

06:00
STRENGTH

07:30
HIIT

18:00
BOXING

19:30
FUNCTIONAL

Allow filtering.

The animation should be subtle.

This is where usability takes priority.

==================================================
23. COMMUNITY — MULTI-FRAME COLLAGE
==================================================

Create a large collage of:

members
trainers
group classes
high fives
training
events

As user scrolls:

images rapidly transition.

Use:

clip-path
+
scale
+
position changes.

The collage should feel alive.

Text:

TRAIN
TOGETHER.

Then:

GET
STRONGER
TOGETHER.

==================================================
24. RECOVERY — CHANGE THE SPEED
==================================================

This section intentionally slows down.

Previous sections:

FAST
AGGRESSIVE
KINETIC.

Recovery:

SLOW
MINIMAL
CALM.

Use slow-motion footage.

Show:

stretching
sauna
mobility
recovery
breathing

if available at the actual club.

Text:

TRAIN HARD.

RECOVER
SMART.

Use longer transitions.

This contrast makes the website feel much more sophisticated.

==================================================
25. FINAL CINEMATIC SEQUENCE
==================================================

Return to video.

Athlete walks through the gym.

Camera follows from behind.

Lights turn on one by one.

The athlete approaches the training floor.

Text:

THIS
IS
YOUR
TIME.

As user scrolls:

THIS

then:

IS

then:

YOUR

then:

TIME.

Final frame:

START TRAINING →

==================================================
26. FINAL CTA
==================================================

Do not use:

CONTACT US.

Use:

START TRAINING →

Secondary:

BOOK A TOUR →

The CTA should remain visible for approximately one viewport.

==================================================
27. SCROLL PHYSICS
==================================================

Use:

Lenis

for smooth scrolling.

Use:

GSAP ScrollTrigger

for:

- pinned sections
- video scrubbing
- image sequences
- horizontal scrolling
- typography
- chapter transitions.

Important:

Do not make the scroll too slow.

Scrolling must still feel natural.

Use velocity-aware animation.

Fast scrolling:
motion accelerates slightly.

Slow scrolling:
motion becomes precise.

==================================================
28. FRAME-BY-FRAME IMPLEMENTATION
==================================================

For high-quality cinematic sections:

Preferred:

MP4/WebM video scrubbing.

Fallback:

image sequence.

Image sequence:

WEBP / AVIF

approximately:

120–240 frames

depending on complexity.

Use:

requestAnimationFrame

and preload frames progressively.

Do not load 240 full-resolution images at once.

Use:

low-resolution preview frames

then progressively load high-quality frames.

==================================================
29. VIDEO SCRUBBING
==================================================

Do not autoplay videos everywhere.

Hero and major cinematic sections:

scroll-controlled.

Video currentTime should correspond to scroll progress.

Concept:

scrollProgress 0.0
→ video currentTime 0s

scrollProgress 0.5
→ video currentTime 3s

scrollProgress 1.0
→ video currentTime 6s

The video should never fight the user's scroll.

==================================================
30. VIDEO SOURCES
==================================================

Development assets:

Pexels Videos
Unsplash
Pixabay

Premium production:

Adobe Stock
Shutterstock
Getty Images

Final production:

Use original gym footage whenever possible.

Ideal original footage:

- 4K
- 24/30fps
- controlled lighting
- clean background
- subject isolated where possible
- consistent color grading.

Shoot separate footage specifically for:

HERO
STRENGTH
CARDIO
FUNCTIONAL
TRAINERS
COMMUNITY
RECOVERY
FINAL CTA.

==================================================
31. IMAGE SOURCES
==================================================

Temporary development:

Unsplash
Pexels

Use images consistently.

Do not randomly combine:

bright gym
+
dark gym
+
orange gym
+
blue gym.

Maintain one visual grade.

==================================================
32. SOUND ARCHITECTURE
==================================================

Do NOT autoplay audio.

Design the website so optional sound can be added.

Provide:

SOUND ON / OFF

If enabled:

subtle gym ambience
breathing
metal plates
barbell impact
footsteps
low-frequency cinematic sound.

Sound should enhance interaction.

Never require sound.

==================================================
33. MOBILE EXPERIENCE
==================================================

Mobile should NOT simply become the desktop version.

Because mobile scrolling is touch-based:

Use shorter sequences.

Desktop:

180 frames

Mobile:

60–90 frames

Desktop:

horizontal pinned sections

Mobile:

vertical snap sections.

Desktop:

cursor interactions

Mobile:

tap interactions.

Desktop:

4K video

Mobile:

optimized 720p/1080p.

==================================================
34. ACCESSIBILITY
==================================================

Provide:

prefers-reduced-motion.

If enabled:

disable:

- frame-heavy sequences
- excessive parallax
- video scrubbing

Replace with:

static images
+
simple fades.

All text must remain readable.

==================================================
35. PERFORMANCE
==================================================

This website will be animation-heavy.

Performance is therefore a priority.

Use:

Next.js
React
TypeScript
Tailwind

GSAP
ScrollTrigger
Lenis

Use:

AVIF
WebP
WebM
MP4

Lazy-load every non-critical asset.

Preload only:

hero assets
first frame
critical fonts.

Use mobile fallbacks.

Do not introduce WebGL unless it provides a meaningful interaction.

==================================================
36. RESPONSIVE SCROLL DESIGN
==================================================

DESKTOP:

Use:

scroll-controlled video
frame sequences
pinned sections
horizontal scroll
cursor previews
kinetic typography.

TABLET:

Reduce:

frame count
video resolution
parallax
complex interactions.

MOBILE:

Use:

short video sequences
touch-controlled progress
vertical storytelling
swipe galleries
simple transitions.

==================================================
37. NAVIGATION
==================================================

Navigation should be extremely minimal.

Logo:

ELITE

FITNESS CLUB

Navigation:

PROGRAMS
TRAINERS
CLASSES
MEMBERSHIP
THE CLUB

CTA:

START TRAINING

During scroll:

navigation becomes compact.

A vertical chapter indicator appears on the right.

Example:

01
02
03
04
05
06

Current chapter uses the accent color.

==================================================
38. PAGE TRANSITION
==================================================

When navigating between pages:

Do not simply fade.

Use:

current page freezes

↓

large image/frame expands

↓

black transition

↓

new page frame appears

↓

new content reveals.

Duration:

600–900ms.

==================================================
39. IMPORTANT — ANIMATION HIERARCHY
============================================================

Not every section should be equally animated.

Use this hierarchy:

LEVEL 1 — CINEMATIC

Hero
Training video
Final CTA

LEVEL 2 — INTERACTIVE

Programs
Transformation
Gym Tour
Membership

LEVEL 3 — EDITORIAL

Trainers
Equipment
Community

LEVEL 4 — FUNCTIONAL

Schedule
Pricing details
Booking
Contact

This prevents the website from becoming exhausting.

==================================================
40. FINAL CREATIVE EXPERIENCE
==================================================

The website should feel less like:

A WEBSITE

and more like:

AN INTERACTIVE FITNESS FILM.

The user should be able to control:

CAMERA
VIDEO
ATHLETE
TYPOGRAPHY
TRANSFORMATION
MOVEMENT

through scrolling.

The experience should progress:

BLACK

↓

ATHLETE

↓

MOVEMENT

↓

INTENSITY

↓

DISCIPLINE

↓

TRANSFORMATION

↓

COMMUNITY

↓

RECOVERY

↓

RESULT

↓

START TRAINING

FINAL EMOTIONAL RESPONSE:

"I NEED TO TRAIN HERE."

The website must be visually unforgettable while remaining extremely usable for:

membership
class discovery
trainer discovery
gym tour
booking
and conversion.