import { useState } from 'react';
import type { FormEvent } from 'react';
import { Play, Pin, PinOff, Trash2, ExternalLink, Video, Sparkles, Filter } from 'lucide-react';


import { ApiError } from '@/lib/api';
import { stamp } from '@/lib/format';
import { useData, useSession } from '../session';
import { Async, Badge, Btn, Empty, Field, FormError, Modal, PageHead, Panel, SelectField, TextArea, useSubmit, useToast } from '../ui';
import { VIDEO_CATEGORIES } from '../types';
import type { FitnessVideo } from '../types';

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function Videos() {
  const { api } = useSession();
  const toast = useToast();
  const videosData = useData<{ videos: FitnessVideo[]; categories: string[] }>('/videos');
  const { busy, fields, message, run } = useSubmit();

  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState<string>(VIDEO_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [pinned, setPinned] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [previewVideo, setPreviewVideo] = useState<FitnessVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectedYtId = extractYouTubeId(videoUrl);

  const postVideo = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await run(() =>
      api('/videos', {
        method: 'POST',
        body: {
          title,
          videoUrl,
          category,
          description: description || undefined,
          pinned,
        },
      })
    );
    if (ok) {
      toast(`Video "${title}" published for gym members!`);
      setTitle('');
      setVideoUrl('');
      setDescription('');
      setPinned(false);
      videosData.reload();
    }
  };

  const togglePin = async (v: FitnessVideo) => {
    try {
      await api(`/videos/${v.id}`, { method: 'PATCH', body: { pinned: !v.pinned } });
      toast(v.pinned ? 'Unpinned video' : 'Pinned video to top of member app');
      videosData.reload();
    } catch {
      toast('Could not update pin status.');
    }
  };

  const removeVideo = async (v: FitnessVideo) => {
    if (!confirm(`Remove video "${v.title}"? Members will no longer see it.`)) return;
    setError(null);
    try {
      await api(`/videos/${v.id}`, { method: 'DELETE' });
      toast('Video removed.');
      videosData.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove that video.');
    }
  };

  return (
    <>
      <PageHead
        title="Fitness Videos & Guides"
        sub="Share exercise tutorials, form guides, and diet tips with your members directly on their mobile app."
      />

      <div className="mb-4">
        <FormError message={error} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
        {/* Left: Add Video Form */}
        <Panel title="Add Fitness Video">
          <form onSubmit={postVideo} className="space-y-4 p-4 sm:p-5" noValidate>
            <Field
              label="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={fields.title}
              placeholder="e.g. How to do Barbell Squats with Perfect Form"
              required
            />

            <SelectField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {VIDEO_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>

            <Field
              label="YouTube or Video Link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              error={fields.videoUrl}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
              required
            />

            {/* Instant YouTube Preview Thumbnail */}
            {detectedYtId && (
              <div className="border border-line/80 bg-ink p-3">
                <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-ok">
                  <Video size={15} className="text-red" />
                  YouTube Video Detected (ID: {detectedYtId})
                </div>

                <div className="relative aspect-video w-full overflow-hidden border border-line bg-graphite">
                  <img
                    src={`https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red text-white shadow-lg">
                      <Play size={20} className="ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TextArea
              label="Key Tips or Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Keep chest high, knees tracking toes, break at hips first..."
              rows={3}
            />

            <label className="flex items-center gap-2.5 cursor-pointer border border-line bg-graphite/40 p-3">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 accent-red rounded border-line"
              />
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-bone font-medium">
                  Pin to Top of Member App
                </p>
                <p className="font-mono text-[10px] text-mute">
                  Highlighted as featured video for all members
                </p>
              </div>
            </label>

            <FormError message={message} />

            <Btn type="submit" busy={busy} variant="accent" className="w-full justify-center">
              <Sparkles size={14} /> Publish Video to Members
            </Btn>
          </form>
        </Panel>

        {/* Right: Published Videos List with Category Filter */}
        <div className="space-y-4">
          <Async state={videosData} label="Loading video library">
            {({ videos }) => {
              const allCount = videos.length;
              const filtered =
                activeCategory === 'All'
                  ? videos
                  : videos.filter((v) => v.category === activeCategory);

              return (
                <Panel
                  title={`Published Videos (${filtered.length}${activeCategory !== 'All' ? ` in ${activeCategory}` : ''})`}
                >
                  {/* Category Filter Chips */}
                  <div className="border-b border-line p-3 bg-ink">
                    <div className="scroll-x flex items-center gap-1.5 pb-1">
                      <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-mute mr-1">
                        <Filter size={11} /> Filter:
                      </span>
                      {['All', ...VIDEO_CATEGORIES].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`shrink-0 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                            activeCategory === cat
                              ? 'bg-bone text-ink font-semibold'
                              : 'border border-line text-mute hover:text-bone hover:border-bone/50'
                          }`}
                        >
                          {cat} {cat === 'All' ? `(${allCount})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <Empty title="No videos in this section">
                      {allCount === 0
                        ? 'Add your first fitness video using the form on the left. Members will see it instantly.'
                        : 'No videos found under this category.'}
                    </Empty>
                  ) : (
                    <div className="divide-y divide-line/60">
                      {filtered.map((v) => {
                        const ytId = v.youtubeId || extractYouTubeId(v.videoUrl);
                        const thumb =
                          v.thumbnailUrl ||
                          (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

                        return (
                          <div
                            key={v.id}
                            className="flex flex-col gap-3 p-4 transition-colors hover:bg-graphite/20 sm:flex-row sm:items-start sm:gap-4"
                          >
                            {/* Thumbnail with Click to Play */}
                            <div
                              onClick={() => setPreviewVideo(v)}
                              className="group relative aspect-video w-full sm:w-44 shrink-0 overflow-hidden border border-line bg-graphite cursor-pointer"
                            >
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={v.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-mute">
                                  <Video size={28} />
                                </div>
                              )}

                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red text-white shadow-lg">
                                  <Play size={16} className="ml-0.5 fill-white" />
                                </div>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge tone="info">{v.category}</Badge>
                                {v.pinned && (
                                  <span className="flex items-center gap-1 border border-red/40 bg-red/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-red">
                                    <Pin size={10} /> Pinned
                                  </span>
                                )}
                              </div>

                              <h3
                                onClick={() => setPreviewVideo(v)}
                                className="mt-1.5 font-display text-lg uppercase tracking-wide text-bone cursor-pointer hover:text-red transition-colors"
                              >
                                {v.title}
                              </h3>

                              {v.description && (
                                <p className="mt-1 line-clamp-2 text-xs text-bone-dim leading-relaxed">
                                  {v.description}
                                </p>
                              )}

                              <p className="mt-2 font-mono text-[10px] text-mute">
                                Posted {stamp(v.createdAt)}
                                {v.postedBy ? ` by ${v.postedBy}` : ''}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 items-center gap-1.5 sm:flex-col sm:items-end">
                              <button
                                type="button"
                                onClick={() => setPreviewVideo(v)}
                                className="flex items-center gap-1 border border-line px-2.5 py-1.5 font-mono text-[11px] text-bone hover:border-bone hover:bg-graphite"
                              >
                                <Play size={12} /> Play
                              </button>

                              <button
                                type="button"
                                onClick={() => togglePin(v)}
                                className="flex items-center gap-1 border border-line px-2.5 py-1.5 font-mono text-[11px] text-mute hover:text-bone hover:border-bone"
                                title={v.pinned ? 'Unpin' : 'Pin to top'}
                              >
                                {v.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                                {v.pinned ? 'Unpin' : 'Pin'}
                              </button>

                              <button
                                type="button"
                                onClick={() => removeVideo(v)}
                                className="flex items-center gap-1 border border-line px-2.5 py-1.5 font-mono text-[11px] text-mute hover:border-red hover:text-red"
                                title="Remove video"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              );
            }}
          </Async>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <Modal
          title={previewVideo.title}
          onClose={() => setPreviewVideo(null)}
        >
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden border border-line bg-black">
              {previewVideo.youtubeId || extractYouTubeId(previewVideo.videoUrl) ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${
                    previewVideo.youtubeId || extractYouTubeId(previewVideo.videoUrl)
                  }?autoplay=1`}
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-3">
              <Badge tone="info">{previewVideo.category}</Badge>
              <a
                href={previewVideo.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-mono text-xs text-mute hover:text-bone"
              >
                Open in YouTube <ExternalLink size={13} />
              </a>
            </div>

            {previewVideo.description && (
              <p className="text-xs text-bone-dim leading-relaxed bg-ink p-3 border border-line/60">
                {previewVideo.description}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
export default Videos;
