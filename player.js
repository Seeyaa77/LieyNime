// Video Player Module
const VideoPlayer = {
    // Config
    API_BASE_URL: 'https://api.sansekai.my.id/api',
    
    // Elements
    playerModal: null,
    playerOverlay: null,
    closePlayerBtn: null,
    playerContainer: null,
    
    // State
    currentEpisodeUrl: null,
    currentResolution: '480p',
    
    // Initialize
    init() {
        this.cacheElements();
        this.setupEventListeners();
    },
    
    // Cache DOM Elements
    cacheElements() {
        this.playerModal = document.getElementById('playerModal');
        this.playerOverlay = document.getElementById('playerOverlay');
        this.closePlayerBtn = document.getElementById('closePlayer');
        this.playerContainer = document.getElementById('playerContainer');
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        this.closePlayerBtn?.addEventListener('click', () => this.closePlayer());
        this.playerOverlay?.addEventListener('click', () => this.closePlayer());
        
        // Close player dengan Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.playerModal?.classList.contains('active')) {
                this.closePlayer();
            }
        });
    },
    
    // Open Video Player
    async openPlayer(episodeUrl, episodeTitle = 'Episode') {
        try {
            this.currentEpisodeUrl = episodeUrl;
            this.showLoadingState(episodeTitle);
            this.playerModal?.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Fetch video links
            await this.fetchVideoLinks(episodeUrl);
        } catch (error) {
            console.error('Error opening player:', error);
            this.showErrorState(error.message);
        }
    },
    
    // Fetch Video Links
    async fetchVideoLinks(chapterUrlId) {
        try {
            const encodedUrlId = encodeURIComponent(chapterUrlId);
            const response = await fetch(
                `${this.API_BASE_URL}/anime/getvideo?chapterUrlId=${encodedUrlId}&reso=${this.currentResolution}`
            );
            
            if (!response.ok) {
                throw new Error('Gagal mengambil video');
            }
            
            const data = await response.json();
            console.log('Video Response:', data);
            
            // Handle response structure: { data: [{ stream, reso }] }
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                const videoData = data.data[0];
                this.renderPlayer(videoData, chapterUrlId);
            } else {
                throw new Error('Video tidak ditemukan');
            }
        } catch (error) {
            throw new Error(`Error: ${error.message}`);
        }
    },
    
    // Render Player
    renderPlayer(videoData, chapterUrlId) {
        const {
            reso = [],
            stream = [],
            likeCount = 0,
            dislikeCount = 0
        } = videoData;
        
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
        
        const html = `
            <div class="player-header">
                <h2 class="player-title">Streaming Video</h2>
                <button class="btn-fullscreen" title="Fullscreen">
                    <span>⛶</span>
                </button>
            </div>
            
            <div class="player-wrapper">
                <div class="player-main">
                    ${currentStreams.length > 0 ? `
                        <div class="player-video">
                            <video id="videoPlayer" 
                                   src="${currentStreams[0].link}" 
                                   controls 
                                   autoplay
                                   controlsList="nodownload">
                                Browser Anda tidak support HTML5 video.
                            </video>
                        </div>
                        
                        <div class="player-controls">
                            <div class="resolution-selector">
                                <label>Resolusi:</label>
                                <select id="resolutionSelect" class="reso-select">
                                    ${reso.map(r => `
                                        <option value="${r}" ${r === this.currentResolution ? 'selected' : ''}>
                                            ${r}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="source-selector">
                                <label>Sumber:</label>
                                <div class="source-buttons">
                                    ${currentStreams.map((s, idx) => `
                                        <button class="btn-source ${idx === 0 ? 'active' : ''}" 
                                                data-link="${s.link}" 
                                                title="Provider: ${this.getProviderName(s.provide)}">
                                            Server ${idx + 1}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="player-error">
                            <p>⚠️ Video tidak tersedia untuk resolusi ini</p>
                        </div>
                    `}
                </div>
                
                <div class="player-info">
                    <div class="info-section">
                        <h3>Informasi Video</h3>
                        <div class="info-item">
                            <label>Status:</label>
                            <span class="status-badge">Aktif</span>
                        </div>
                        <div class="info-item">
                            <label>Format:</label>
                            <span>${stream[0]?.reso || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Rating</h3>
                        <div class="rating-buttons">
                            <button class="btn-rate btn-like">
                                <span>👍</span>
                                <span class="count">${likeCount}</span>
                            </button>
                            <button class="btn-rate btn-dislike">
                                <span>👎</span>
                                <span class="count">${dislikeCount}</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Resolusi Tersedia</h3>
                        <div class="reso-list">
                            ${reso.map(r => `
                                <span class="reso-badge ${r === this.currentResolution ? 'active' : ''}">${r}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.playerContainer.innerHTML = html;
        this.setupPlayerControls(chapterUrlId, streamsByRes, reso);
    },
    
    // Setup Player Controls
    setupPlayerControls(chapterUrlId, streamsByRes, availableReso) {
        // Resolution selector
        const resSelect = this.playerContainer.querySelector('#resolutionSelect');
        const sourceButtons = this.playerContainer.querySelectorAll('.btn-source');
        const videoPlayer = this.playerContainer.querySelector('#videoPlayer');
        
        if (resSelect) {
            resSelect.addEventListener('change', (e) => {
                this.currentResolution = e.target.value;
                // Refresh video with new resolution
                this.fetchVideoLinks(chapterUrlId);
            });
        }
        
        // Source buttons
        sourceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const link = btn.dataset.link;
                
                // Update active state
                sourceButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update video source
                if (videoPlayer) {
                    videoPlayer.src = link;
                    videoPlayer.play();
                }
            });
        });
        
        // Fullscreen button
        const fullscreenBtn = this.playerContainer.closest('.player-wrapper')?.parentElement?.querySelector('.btn-fullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (videoPlayer?.requestFullscreen) {
                    videoPlayer.requestFullscreen();
                } else if (videoPlayer?.webkitRequestFullscreen) {
                    videoPlayer.webkitRequestFullscreen();
                }
            });
        }
        
        // Like/Dislike buttons
        const likeBtn = this.playerContainer.querySelector('.btn-like');
        const dislikeBtn = this.playerContainer.querySelector('.btn-dislike');
        
        likeBtn?.addEventListener('click', () => {
            likeBtn.classList.toggle('voted');
            dislikeBtn?.classList.remove('voted');
        });
        
        dislikeBtn?.addEventListener('click', () => {
            dislikeBtn.classList.toggle('voted');
            likeBtn?.classList.remove('voted');
        });
    },
    
    // Get Provider Name
    getProviderName(provideId) {
        const providers = {
            1: 'Pixeldrain',
            2: 'Animekita',
            99: 'Pixeldrain'
        };
        return providers[provideId] || `Provider ${provideId}`;
    },
    
    // Show Loading State
    showLoadingState(title = 'Episode') {
        const html = `
            <div class="player-loading">
                <div class="spinner"></div>
                <p>Memuat video: ${title}...</p>
            </div>
        `;
        this.playerContainer.innerHTML = html;
    },
    
    // Show Error State
    showErrorState(message) {
        const html = `
            <div class="player-error-full">
                <p>⚠️ ${message}</p>
                <button onclick="VideoPlayer.closePlayer()" class="btn-close">Tutup</button>
            </div>
        `;
        this.playerContainer.innerHTML = html;
    },
    
    // Close Player
    closePlayer() {
        const videoPlayer = this.playerContainer?.querySelector('#videoPlayer');
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = '';
        }
        
        this.playerModal?.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.playerContainer.innerHTML = '';
        this.currentEpisodeUrl = null;
    }
};

// Initialize Video Player on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    VideoPlayer.init();
});
