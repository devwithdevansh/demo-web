import { Router } from 'express';
import { z } from 'zod';
import { FitnessVideo, VIDEO_CATEGORIES } from '../models/index.js';
import { requireRole } from '../middleware/auth.js';
import { body, findOwned, demoCap, zText } from '../middleware/http.js';

const router = Router();
const desk = requireRole('owner', 'staff');

export function extractYouTubeId(url) {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// List all videos for this gym (accessible to owner/staff/trainer/member)
router.get('/videos', async (req, res) => {
  const videos = await FitnessVideo.find({ gymId: req.gymId }).sort({ pinned: -1, createdAt: -1 }).limit(100);
  res.json({
    videos: videos.map((v) => ({
      id: String(v._id),
      title: v.title,
      category: v.category,
      videoUrl: v.videoUrl,
      youtubeId: v.youtubeId || null,
      thumbnailUrl: v.thumbnailUrl || (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : null),
      description: v.description || '',
      pinned: !!v.pinned,
      postedBy: v.postedBy || '',
      createdAt: v.createdAt,
    })),
    categories: VIDEO_CATEGORIES,
  });
});

// Add video
router.post(
  '/videos',
  desk,
  demoCap(FitnessVideo, 50),
  body(
    z.object({
      title: z.string().trim().min(2, 'Add a video title.').max(120),
      videoUrl: z.string().trim().min(5, 'Provide a valid video URL.').max(500),
      category: z.enum(VIDEO_CATEGORIES).default('Workout Form'),
      description: zText(1000).optional(),
      pinned: z.boolean().optional(),
    }),
  ),
  async (req, res) => {
    const youtubeId = extractYouTubeId(req.data.videoUrl);
    const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
    const video = await FitnessVideo.create({
      ...req.data,
      gymId: req.gymId,
      youtubeId,
      thumbnailUrl,
      postedBy: req.user.name,
    });
    res.status(201).json({
      video: {
        id: String(video._id),
        title: video.title,
        category: video.category,
        videoUrl: video.videoUrl,
        youtubeId: video.youtubeId,
        thumbnailUrl: video.thumbnailUrl,
        description: video.description,
        pinned: video.pinned,
        postedBy: video.postedBy,
        createdAt: video.createdAt,
      },
    });
  },
);

// Toggle pin / update video
router.patch(
  '/videos/:id',
  desk,
  body(
    z.object({
      pinned: z.boolean().optional(),
      title: z.string().trim().min(2).max(120).optional(),
      category: z.enum(VIDEO_CATEGORIES).optional(),
      description: zText(1000).optional(),
    }),
  ),
  async (req, res) => {
    const video = await findOwned(FitnessVideo, req, req.params.id, 'Video');
    if (req.data.pinned !== undefined) video.pinned = req.data.pinned;
    if (req.data.title !== undefined) video.title = req.data.title;
    if (req.data.category !== undefined) video.category = req.data.category;
    if (req.data.description !== undefined) video.description = req.data.description;
    await video.save();
    res.json({ ok: true, video });
  },
);

// Remove video
router.delete('/videos/:id', desk, async (req, res) => {
  await (await findOwned(FitnessVideo, req, req.params.id, 'Video')).deleteOne();
  res.json({ ok: true });
});

export default router;
