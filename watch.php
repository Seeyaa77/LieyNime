<?php
// Get parameters
$animeTitle = isset($_GET['anime']) ? htmlspecialchars($_GET['anime']) : 'anime';
$episodeUrl = isset($_GET['ep']) ? htmlspecialchars($_GET['ep']) : '';
$seriesId = isset($_GET['series']) ? htmlspecialchars($_GET['series']) : '';

if (empty($episodeUrl)) {
    die('<h1>Error: Episode tidak ditemukan</h1>');
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menonton - <?php echo $animeTitle; ?> | LieYNime</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .watch-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
        }

        .watch-container {
            flex: 1;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
            padding: 2rem;
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
        }

        .watch-main {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .watch-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }

        .watch-title {
            font-size: 1.8rem;
            color: var(--accent-color);
        }

        .episode-info {
            font-size: 0.95rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        .episode-info strong {
            color: var(--text-primary);
        }

        .btn-back {
            padding: 0.7rem 1.5rem;
            background: var(--secondary-dark);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-radius: 6px;
            cursor: pointer;
            transition: var(--transition);
            font-weight: 600;
        }

        .btn-back:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
        }

        .episode-nav {
            display: flex;
            gap: 1rem;
            justify-content: space-between;
            padding: 1.5rem;
            background: var(--secondary-dark);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .btn-nav {
            flex: 1;
            padding: 1rem;
            background: var(--hover-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
        }

        .btn-nav:hover:not(:disabled) {
            border-color: var(--accent-color);
            color: var(--accent-color);
            transform: translateY(-2px);
        }

        .btn-nav:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .btn-nav.btn-prev {
            justify-content: flex-start;
        }

        .btn-nav.btn-next {
            justify-content: flex-end;
        }

        .btn-nav.btn-next:disabled,
        .btn-nav.btn-prev:disabled {
            background: var(--hover-bg);
        }

        .watch-video {
            width: 100%;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }

        #videoPlayer {
            width: 100%;
            height: 600px;
            display: block;
        }

        .watch-controls {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem;
            background: var(--secondary-dark);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
        }

        .control-label {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 0.95rem;
        }

        .reso-select {
            padding: 0.8rem;
            background: var(--hover-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.95rem;
            transition: var(--transition);
        }

        .reso-select:hover {
            border-color: var(--accent-color);
        }

        .source-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
        }

        .btn-source {
            padding: 0.8rem;
            background: var(--hover-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: var(--transition);
            text-align: left;
            word-break: break-word;
        }

        .btn-source:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
        }

        .btn-source.active {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2));
            border-color: var(--accent-color);
            color: var(--accent-color);
        }

        .rating-section {
            display: flex;
            gap: 1rem;
        }

        .btn-rate {
            flex: 1;
            padding: 0.8rem;
            background: var(--hover-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-rate:hover {
            border-color: var(--accent-color);
        }

        .btn-rate.voted {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1));
            border-color: var(--accent-color);
            color: var(--accent-color);
        }

        .watch-sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .sidebar-section {
            padding: 1rem;
            background: var(--secondary-dark);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .sidebar-title {
            font-size: 1rem;
            color: var(--accent-color);
            margin-bottom: 1rem;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid var(--border-color);
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
            font-size: 0.9rem;
        }

        .info-label {
            color: var(--text-secondary);
            font-weight: 600;
        }

        .info-value {
            color: var(--text-primary);
        }

        .status-badge {
            background: linear-gradient(135deg, rgba(100, 200, 100, 0.2), rgba(100, 200, 100, 0.1));
            color: #64c864;
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.85rem;
        }

        .loading-spinner {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
        }

        .loading-spinner.active {
            display: block;
        }

        .spinner {
            border: 4px solid var(--hover-bg);
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }

        @media (max-width: 1024px) {
            .watch-container {
                grid-template-columns: 1fr;
            }

            #videoPlayer {
                height: 500px;
            }
        }

        @media (max-width: 768px) {
            .watch-container {
                padding: 1rem;
                gap: 1rem;
            }

            .watch-header {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }

            .watch-title {
                font-size: 1.3rem;
            }

            .btn-back {
                width: 100%;
            }

            #videoPlayer {
                height: 300px;
            }

            .watch-controls {
                padding: 1rem;
                gap: 1rem;
            }
        }

        @media (max-width: 480px) {
            .watch-container {
                padding: 0.5rem;
                gap: 0.5rem;
            }

            #videoPlayer {
                height: 200px;
            }

            .watch-sidebar {
                display: none;
            }

            .btn-source {
                font-size: 0.8rem;
                padding: 0.6rem;
            }
        }
    </style>
</head>
<body class="watch-page">
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">
                <h1>🎬 LieYNime</h1>
            </div>
            <div class="search-container" style="flex: 1; max-width: 400px;">
                <input type="text" class="search-input" placeholder="Cari anime...">
                <button class="search-btn">Cari</button>
            </div>
        </div>
    </nav>

    <!-- Watch Container -->
    <div class="watch-container">
        <!-- Main Content -->
        <div class="watch-main">
            <!-- Header -->
            <div class="watch-header">
                <div>
                    <h1 class="watch-title" id="episodeTitle">Memuat...</h1>
                    <div class="episode-info">
                        Sedang menonton: <strong id="currentEpisodeInfo">-</strong>
                    </div>
                </div>
                <button class="btn-back" onclick="history.back()">← Kembali</button>
            </div>

            <!-- Video Player -->
            <div class="watch-video" id="videoContainer">
                <video id="videoPlayer" controls controlsList="nodownload">
                    Browser Anda tidak support HTML5 video.
                </video>
            </div>

            <!-- Episode Navigation -->
            <div class="episode-nav">
                <button class="btn-nav btn-prev" id="btnPrevEpisode" disabled>
                    <span>← Sebelumnya</span>
                </button>
                <button class="btn-nav btn-next" id="btnNextEpisode" disabled>
                    <span>Selanjutnya →</span>
                </button>
            </div>

            <!-- Controls -->
            <div class="watch-controls">
                <div class="control-group">
                    <label class="control-label">Resolusi:</label>
                    <select id="resolutionSelect" class="reso-select">
                        <option value="480p">Memuat...</option>
                    </select>
                </div>

                <div class="control-group">
                    <label class="control-label">Pilih Server:</label>
                    <div class="source-buttons" id="sourceButtons">
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Memuat server...</p>
                    </div>
                </div>

                <div class="control-group">
                    <label class="control-label">Rating:</label>
                    <div class="rating-section">
                        <button class="btn-rate btn-like">
                            👍 <span id="likeCount">0</span>
                        </button>
                        <button class="btn-rate btn-dislike">
                            👎 <span id="dislikeCount">0</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="watch-sidebar">
            <div class="sidebar-section">
                <h3 class="sidebar-title">Informasi</h3>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="status-badge">Aktif</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Format:</span>
                    <span class="info-value" id="videoFormat">480p</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Server:</span>
                    <span class="info-value" id="serverCount">-</span>
                </div>
            </div>

            <div class="sidebar-section">
                <h3 class="sidebar-title">Resolusi Tersedia</h3>
                <div id="resoList" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <!-- Resolusi badges -->
                </div>
            </div>
        </div>
    </div>

    <!-- Loading Spinner -->
    <div class="loading-spinner" id="loadingSpinner">
        <div class="spinner"></div>
    </div>

    <!-- Floating Donation Button -->
    <a href="https://saweria.co/skirtorc" target="_blank" class="floating-donate" title="Dukung Kami dengan Donasi"></a>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; 2025 LieYNime. Streaming anime favorit Anda di sini.</p>
        <p>Data dari <a href="https://api.sansekai.my.id/" target="_blank">SanSekai API</a></p>
    </footer>

    <script>
        const WatchPlayer = {
            API_BASE_URL: 'https://api.sansekai.my.id/api',
            currentResolution: '480p',
            episodeUrl: '<?php echo addslashes($episodeUrl); ?>',
            animeTitle: '<?php echo addslashes($animeTitle); ?>',
            seriesId: '<?php echo addslashes($seriesId); ?>',
            currentStreams: [],
            allEpisodes: [],
            currentEpisodeIndex: -1,

            init() {
                this.loadVideoLinks();
                this.setupEventListeners();
                // Load series data untuk episode navigation
                if (this.seriesId) {
                    this.loadSeriesData();
                }
            },

            setupEventListeners() {
                const resSelect = document.getElementById('resolutionSelect');
                resSelect?.addEventListener('change', (e) => {
                    this.currentResolution = e.target.value;
                    this.loadVideoLinks();
                });

                const likeBtn = document.querySelector('.btn-like');
                const dislikeBtn = document.querySelector('.btn-dislike');

                likeBtn?.addEventListener('click', () => {
                    likeBtn.classList.toggle('voted');
                    dislikeBtn?.classList.remove('voted');
                });

                dislikeBtn?.addEventListener('click', () => {
                    dislikeBtn.classList.toggle('voted');
                    likeBtn?.classList.remove('voted');
                });

                // Episode navigation
                document.getElementById('btnPrevEpisode')?.addEventListener('click', () => {
                    if (this.currentEpisodeIndex > 0) {
                        this.goToEpisode(this.currentEpisodeIndex - 1);
                    }
                });

                document.getElementById('btnNextEpisode')?.addEventListener('click', () => {
                    if (this.currentEpisodeIndex < this.allEpisodes.length - 1) {
                        this.goToEpisode(this.currentEpisodeIndex + 1);
                    }
                });
            },

            async loadSeriesData() {
                try {
                    // Fetch detail untuk get semua episodes
                    const encodedSeriesId = encodeURIComponent(this.seriesId);
                    const response = await fetch(
                        `${this.API_BASE_URL}/anime/detail?urlId=${encodedSeriesId}`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                            const detailData = data.data[0];
                            this.allEpisodes = (detailData.chapter || []).reverse(); // Reverse untuk descending order
                            
                            // Find current episode index
                            this.currentEpisodeIndex = this.allEpisodes.findIndex(
                                ep => ep.url === this.episodeUrl
                            );
                            
                            this.updateEpisodeNavigation();
                        }
                    }
                } catch (error) {
                    console.error('Error loading series data:', error);
                }
            },

            updateEpisodeNavigation() {
                const btnPrev = document.getElementById('btnPrevEpisode');
                const btnNext = document.getElementById('btnNextEpisode');
                const infoElement = document.getElementById('currentEpisodeInfo');

                if (this.currentEpisodeIndex >= 0 && this.allEpisodes.length > 0) {
                    const currentEp = this.allEpisodes[this.currentEpisodeIndex];
                    infoElement.textContent = `Episode ${currentEp.ch} (${currentEp.date || 'N/A'})`;

                    // Update prev button
                    btnPrev.disabled = this.currentEpisodeIndex <= 0;
                    if (this.currentEpisodeIndex > 0) {
                        const prevEp = this.allEpisodes[this.currentEpisodeIndex - 1];
                        btnPrev.innerHTML = `<span>← ${prevEp.ch}</span>`;
                    }

                    // Update next button
                    btnNext.disabled = this.currentEpisodeIndex >= this.allEpisodes.length - 1;
                    if (this.currentEpisodeIndex < this.allEpisodes.length - 1) {
                        const nextEp = this.allEpisodes[this.currentEpisodeIndex + 1];
                        btnNext.innerHTML = `<span>${nextEp.ch} →</span>`;
                    }
                }
            },

            goToEpisode(index) {
                if (index >= 0 && index < this.allEpisodes.length) {
                    const episode = this.allEpisodes[index];
                    const newUrl = `/watch.php?anime=${encodeURIComponent(this.animeTitle)}&ep=${encodeURIComponent(episode.url)}&series=${encodeURIComponent(this.seriesId)}`;
                    window.location.href = newUrl;
                }
            },

            showLoading(show = true) {
                document.getElementById('loadingSpinner').classList.toggle('active', show);
            },

            async loadVideoLinks() {
                try {
                    this.showLoading(true);
                    const encodedUrl = encodeURIComponent(this.episodeUrl);
                    const response = await fetch(
                        `${this.API_BASE_URL}/anime/getvideo?chapterUrlId=${encodedUrl}&reso=${this.currentResolution}`
                    );

                    if (!response.ok) {
                        throw new Error('Gagal mengambil video');
                    }

                    const data = await response.json();
                    console.log('Video Response:', data);

                    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                        const videoData = data.data[0];
                        this.renderPlayer(videoData);
                    } else {
                        throw new Error('Video tidak ditemukan');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error: ' + error.message);
                } finally {
                    this.showLoading(false);
                }
            },

            renderPlayer(videoData) {
                const { reso = [], stream = [], likeCount = 0, dislikeCount = 0 } = videoData;

                // Update resolution list
                const resoSelect = document.getElementById('resolutionSelect');
                resoSelect.innerHTML = reso.map(r => 
                    `<option value="${r}" ${r === this.currentResolution ? 'selected' : ''}>${r}</option>`
                ).join('');

                // Group streams by resolution
                const streamsByRes = {};
                stream.forEach(s => {
                    if (!streamsByRes[s.reso]) {
                        streamsByRes[s.reso] = [];
                    }
                    streamsByRes[s.reso].push(s);
                });

                // Get streams for current resolution
                const currentStreams = streamsByRes[this.currentResolution] || stream;
                this.currentStreams = currentStreams;

                // Update source buttons
                const sourceButtons = document.getElementById('sourceButtons');
                sourceButtons.innerHTML = currentStreams.map((s, idx) => `
                    <button class="btn-source ${idx === 0 ? 'active' : ''}" 
                            data-link="${s.link}" 
                            data-index="${idx}">
                        Server ${idx + 1}
                    </button>
                `).join('');

                // Setup source button listeners
                sourceButtons.querySelectorAll('.btn-source').forEach((btn, idx) => {
                    btn.addEventListener('click', () => {
                        sourceButtons.querySelectorAll('.btn-source').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        
                        const videoPlayer = document.getElementById('videoPlayer');
                        videoPlayer.src = btn.dataset.link;
                        videoPlayer.play();
                    });
                });

                // Set first video source
                if (currentStreams.length > 0) {
                    document.getElementById('videoPlayer').src = currentStreams[0].link;
                }

                // Update title
                document.getElementById('episodeTitle').textContent = this.animeTitle;

                // Update sidebar
                document.getElementById('videoFormat').textContent = this.currentResolution;
                document.getElementById('serverCount').textContent = currentStreams.length;
                document.getElementById('likeCount').textContent = likeCount;
                document.getElementById('dislikeCount').textContent = dislikeCount;

                // Update resolution badges
                const resoList = document.getElementById('resoList');
                resoList.innerHTML = reso.map(r => `
                    <span style="
                        background: ${r === this.currentResolution ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1))' : 'var(--hover-bg)'};
                        border: 1px solid ${r === this.currentResolution ? 'var(--accent-color)' : 'var(--border-color)'};
                        color: ${r === this.currentResolution ? 'var(--accent-color)' : 'var(--text-secondary)'};
                        padding: 0.4rem 0.8rem;
                        border-radius: 4px;
                        font-size: 0.85rem;
                        font-weight: 600;
                    ">${r}</span>
                `).join('');
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            WatchPlayer.init();
        });
    </script>
</body>
</html>
