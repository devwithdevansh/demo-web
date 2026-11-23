import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class VideosScreen extends StatefulWidget {
  const VideosScreen({super.key, this.showAdmin = true});

  final bool showAdmin;

  @override
  State<VideosScreen> createState() => _VideosScreenState();
}

class _VideosScreenState extends State<VideosScreen> {
  late Future<Json> _future;
  String _category = 'All';

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Json> _load() => context.read<AppState>().api.videos();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _add() async {
    final categories = await _categories();
    if (!mounted) return;
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Add a video',
      child: _VideoSheet(categories: categories),
    );
    if (saved == true && mounted) {
      _reload();
      showSnack(context, 'Video added.');
    }
  }

  Future<List<String>> _categories() async {
    try {
      final data = await context.read<AppState>().api.videos();
      return (data['categories'] as List? ?? const []).map((c) => '$c').toList();
    } catch (_) {
      return const [];
    }
  }

  Future<void> _open(FitnessVideo video) async {
    var url = video.videoUrl;
    if (video.youtubeId != null && video.youtubeId!.isNotEmpty && !url.contains('youtube')) {
      url = 'https://www.youtube.com/watch?v=${video.youtubeId}';
    }
    final uri = Uri.tryParse(url);
    if (uri == null || !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) showSnack(context, 'Could not open this video link.', error: true);
    }
  }

  Future<void> _pin(FitnessVideo video) async {
    try {
      await context.read<AppState>().api.updateVideo(video.id, {'pinned': !video.pinned});
      if (mounted) _reload();
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  Future<void> _delete(FitnessVideo video) async {
    final ok = await showConfirm(
      context,
      title: 'Delete this video?',
      message: '"${video.title}" is removed for every member.',
      confirmLabel: 'Delete',
      danger: true,
    );
    if (!ok) return;
    if (!mounted) return;
    try {
      await context.read<AppState>().api.deleteVideo(video.id);
      if (mounted) _reload();
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppState>().session?.user;
    final canAdmin = widget.showAdmin && (user?.isOwner == true || user?.isStaff == true);
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Library',
            title: 'Training videos.',
            subtitle: 'Form checks, machine guides and short lessons, posted by the gym.',
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              if (canAdmin)
                FilledButton.icon(
                  onPressed: _add,
                  icon: const Icon(Icons.add, size: 17),
                  label: const Text('Add video'),
                ),
            ],
          ),
          const SizedBox(height: 16),
          FutureBuilder<Json>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading videos');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data ?? <String, dynamic>{};
              final videos = asList(data['videos']).map(FitnessVideo.fromJson).toList();
              final categories = (data['categories'] as List? ?? const []).map((c) => '$c').toList();
              final filters = ['All', ...categories.where((c) => videos.any((v) => v.category == c))];
              final visible = _category == 'All' ? videos : videos.where((v) => v.category == _category).toList();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final filter in filters)
                        GestureDetector(
                          onTap: () => setState(() => _category = filter),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: filter == _category ? ForgeColors.red.withValues(alpha: 0.14) : ForgeColors.ink2,
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: filter == _category ? ForgeColors.red : ForgeColors.line),
                            ),
                            child: Text(
                              filter.toUpperCase(),
                              style: ForgeTheme.mono(
                                9,
                                letterSpacing: 1,
                                color: filter == _category ? ForgeColors.bone : ForgeColors.mute,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  if (visible.isEmpty)
                    EmptyPanel(
                      title: 'No videos yet',
                      message: canAdmin
                          ? 'Add a YouTube link or a short clip for your members.'
                          : 'The gym has not posted any videos yet.',
                      icon: Icons.play_circle_outline,
                      action: canAdmin ? FilledButton(onPressed: _add, child: const Text('Add the first video')) : null,
                    )
                  else
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final columns = (constraints.maxWidth / 310).floor().clamp(1, 4);
                        final width = (constraints.maxWidth - 12 * (columns - 1)) / columns;
                        return Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: [
                            for (final video in visible)
                              SizedBox(
                                width: width,
                                child: _VideoCard(
                                  video: video,
                                  canAdmin: canAdmin,
                                  onOpen: () => _open(video),
                                  onPin: () => _pin(video),
                                  onDelete: () => _delete(video),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _VideoCard extends StatelessWidget {
  const _VideoCard({
    required this.video,
    required this.canAdmin,
    required this.onOpen,
    required this.onPin,
    required this.onDelete,
  });

  final FitnessVideo video;
  final bool canAdmin;
  final VoidCallback onOpen;
  final VoidCallback onPin;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      padding: EdgeInsets.zero,
      onTap: onOpen,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (video.thumbnailUrl != null && video.thumbnailUrl!.isNotEmpty)
                    Image.network(
                      video.thumbnailUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => const _ThumbPlaceholder(),
                    )
                  else
                    const _ThumbPlaceholder(),
                  Center(
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.55),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
                      ),
                      child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 27),
                    ),
                  ),
                  if (video.pinned)
                    const Positioned(
                      top: 9,
                      left: 9,
                      child: StatusPill(label: 'pinned', color: ForgeColors.red, dense: true),
                    ),
                  if (canAdmin)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: PopupMenuButton<String>(
                        tooltip: 'Video actions',
                        color: ForgeColors.panel,
                        icon: const Icon(Icons.more_vert, size: 17, color: Colors.white),
                        onSelected: (value) {
                          if (value == 'pin') onPin();
                          if (value == 'delete') onDelete();
                        },
                        itemBuilder: (_) => [
                          PopupMenuItem(value: 'pin', child: Text(video.pinned ? 'Unpin video' : 'Pin to top')),
                          const PopupMenuItem(value: 'delete', child: Text('Delete video')),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(13),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    video.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: ForgeTheme.body(12.5, weight: FontWeight.w700, color: ForgeColors.bone),
                  ),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      StatusPill(label: video.category, color: ForgeColors.blue, dense: true),
                      const Spacer(),
                      Text(shortDay(video.createdAt), style: ForgeTheme.mono(8, letterSpacing: 0.4)),
                    ],
                  ),
                  if (video.description.isNotEmpty) ...[
                    const SizedBox(height: 7),
                    Text(
                      video.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ThumbPlaceholder extends StatelessWidget {
  const _ThumbPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [ForgeColors.panelHi, ForgeColors.ink2],
        ),
      ),
      child: const Center(child: Icon(Icons.fitness_center, size: 30, color: ForgeColors.mute)),
    );
  }
}

class _VideoSheet extends StatefulWidget {
  const _VideoSheet({required this.categories});

  final List<String> categories;

  @override
  State<_VideoSheet> createState() => _VideoSheetState();
}

class _VideoSheetState extends State<_VideoSheet> {
  final _title = TextEditingController();
  final _url = TextEditingController();
  final _description = TextEditingController();
  late String _category = widget.categories.isEmpty ? 'Workout Form' : widget.categories.first;
  bool _pinned = false;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _url.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_title.text.trim().length < 2) {
      setState(() => _error = 'Add a video title.');
      return;
    }
    if (!_url.text.trim().startsWith('http')) {
      setState(() => _error = 'Paste a full link starting with https://');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.addVideo({
        'title': _title.text.trim(),
        'videoUrl': _url.text.trim(),
        'category': _category,
        'description': _description.text.trim(),
        'pinned': _pinned,
      });
      if (mounted) Navigator.pop(context, true);
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'YouTube links get a thumbnail automatically. A link to any watchable clip works too.',
          style: ForgeTheme.body(11.5, color: ForgeColors.mute),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        ForgeField(
          label: 'Title',
          child: TextField(
            controller: _title,
            decoration: const InputDecoration(hintText: 'e.g. How to brace on a squat'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Video link',
          child: TextField(
            controller: _url,
            keyboardType: TextInputType.url,
            decoration: const InputDecoration(hintText: 'https://youtube.com/watch?v=…'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Category',
          child: ChoiceRow<String>(
            values: widget.categories.isEmpty ? const ['Workout Form'] : widget.categories,
            selected: _category,
            label: (c) => c,
            onSelected: (c) => setState(() => _category = c),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Description (optional)',
          child: TextField(
            controller: _description,
            maxLines: 3,
            decoration: const InputDecoration(hintText: 'What should they watch for?'),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: Text('Pin to the top of the library', style: ForgeTheme.body(11.5, color: ForgeColors.boneDim)),
            ),
            Switch(value: _pinned, onChanged: (value) => setState(() => _pinned = value)),
          ],
        ),
        const SizedBox(height: 10),
        LoadingButton(label: 'Add video', loading: _busy, onPressed: _save),
      ],
    );
  }
}
