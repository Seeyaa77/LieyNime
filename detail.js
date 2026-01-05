// Detail Page Module
const DetailPage = {
    // Config
    API_BASE_URL: 'https://api.sansekai.my.id/api',
    
    // Elements
    detailModal: null,
    modalOverlay: null,
    closeModalBtn: null,
    detailContainer: null,
    
    // Initialize
    init() {
        this.cacheElements();
        this.setupEventListeners();
    },
    
    // Cache DOM Elements
    cacheElements() {
        this.detailModal = document.getElementById('detailModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeModalBtn = document.getElementById('closeModal');
        this.detailContainer = document.getElementById('detailContainer');
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', () => this.closeModal());
        
        // Close modal dengan Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.detailModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    },
    
    // Open Detail Modal
    async openDetail(animeId, animeData = null) {
        try {
            // Show loading state
            this.showLoadingState();
            this.detailModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Jika data sudah tersedia, gunakan langsung
            if (animeData && animeData.url) {
                // Fetch detail menggunakan urlId
                await this.fetchAnimeDetail(animeData.url);
            } else if (animeData) {
                this.renderDetail(animeData);
            } else {
                // Fallback ke ID
                throw new Error('Tidak ada URL anime yang tersedia');
            }
        } catch (error) {
            console.error('Error opening detail:', error);
            this.showErrorState(error.message);
        }
    },
    
    // Fetch Anime Detail
    async fetchAnimeDetail(urlId) {
        try {
            // Use /anime/detail endpoint dengan urlId (bukan /anime/{id})
            const encodedUrlId = encodeURIComponent(urlId);
            const response = await fetch(`${this.API_BASE_URL}/anime/detail?urlId=${encodedUrlId}`);
            
            if (!response.ok) {
                throw new Error('Gagal mengambil detail anime');
            }
            
            const data = await response.json();
            console.log('Detail Response:', data);
            
            // Handle response structure: { data: [{ episodes/chapters array }] }
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                const detailData = data.data[0];
                this.renderDetail(detailData);
            } else {
                throw new Error('Format response tidak sesuai');
            }
        } catch (error) {
            throw new Error(`Error: ${error.message}`);
        }
    },
    
    // Render Detail Content
    renderDetail(anime) {
        const {
            judul = 'N/A',
            cover = 'https://via.placeholder.com/400x500?text=No+Image',
            sinopsis = 'Sinopsis tidak tersedia',
            genre = [],
            author = 'N/A',
            rating = 'N/A',
            status = 'Unknown',
            published = 'N/A',
            type = 'N/A',
            chapter = [],  // Episodes array
            series_id = '',  // Series ID untuk navigasi episode
            url = ''  // URL alias untuk series ID
        } = anime;
        
        const genreList = Array.isArray(genre) ? genre.filter(g => g) : [];
        const episodes = Array.isArray(chapter) ? chapter : [];
        
        const html = `
            <div class="detail-header">
                <div class="detail-cover">
                    <img src="${cover}" alt="${judul}" 
                         onerror="this.src='https://via.placeholder.com/400x500?text=No+Image'">
                    <div class="detail-overlay"></div>
                </div>
                
                <div class="detail-info">
                    <h1 class="detail-title">${judul}</h1>
                    
                    <div class="detail-meta">
                        <div class="meta-item">
                            <span class="meta-label">Rating</span>
                            <span class="meta-value score">${rating}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Status</span>
                            <span class="meta-value status ${status.toLowerCase() === 'completed' ? 'completed' : ''}">${status}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Type</span>
                            <span class="meta-value">${type}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Studio</span>
                            <span class="meta-value">${author}</span>
                        </div>
                    </div>
                    
                    <div class="detail-meta-row">
                        <div class="meta-item">
                            <span class="meta-label">Tanggal Rilis</span>
                            <span class="meta-value">${published}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Total Episode</span>
                            <span class="meta-value">${episodes.length || 'N/A'}</span>
                        </div>
                    </div>
                    
                    ${genreList.length > 0 ? `
                        <div class="detail-genres">
                            <span class="meta-label">Genre:</span>
                            <div class="genres-list">
                                ${genreList.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="detail-synopsis">
                <h2>Sinopsis</h2>
                <p>${sinopsis || 'Sinopsis tidak tersedia'}</p>
            </div>
            
            <div class="detail-actions">
                <button class="btn-action btn-watch">
                    <span>▶</span> Tonton Sekarang
                </button>
                <button class="btn-action btn-favorite">
                    <span>♡</span> Tambah ke Favorit
                </button>
                <button class="btn-action btn-share">
                    <span>⤴</span> Bagikan
                </button>
            </div>
            
            ${episodes.length > 0 ? `
                <div class="detail-episodes">
                    <h2>Daftar Episode</h2>
                    <div class="episodes-list">
                        ${episodes.map((ep, idx) => `
                            <div class="episode-item" data-episode-url="${ep.url}" data-episode-title="${ep.ch}">
                                <div class="episode-number">${ep.ch}</div>
                                <div class="episode-info">
                                    <div class="episode-title">${ep.ch}</div>
                                    <div class="episode-date">${ep.date || 'N/A'}</div>
                                </div>
                                <button class="btn-play" data-url="${ep.url}">
                                    <span>▶</span> Tonton
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        this.detailContainer.innerHTML = html;
        
        // Store series_id untuk digunakan di setupEpisodeButtons
        const seriesIdValue = series_id || url || '';
        this.detailContainer.dataset.seriesId = seriesIdValue;
        
        this.setupDetailActions(anime);
        this.setupEpisodeButtons(seriesIdValue);
    },
    
    // Setup Detail Action Buttons
    setupDetailActions(anime) {
        const watchBtn = this.detailContainer.querySelector('.btn-watch');
        const favoriteBtn = this.detailContainer.querySelector('.btn-favorite');
        const shareBtn = this.detailContainer.querySelector('.btn-share');
        
        watchBtn?.addEventListener('click', () => {
            // Click episode pertama jika ada
            const firstEpisode = this.detailContainer.querySelector('.episode-item');
            if (firstEpisode) {
                firstEpisode.querySelector('.btn-play').click();
            }
        });
        
        favoriteBtn?.addEventListener('click', () => {
            this.handleFavorite(anime);
        });
        
        shareBtn?.addEventListener('click', () => {
            this.handleShare(anime);
        });
    },
    
    // Setup Episode Buttons
    setupEpisodeButtons(seriesId) {
        const episodeButtons = this.detailContainer.querySelectorAll('.btn-play');
        
        episodeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const episodeUrl = btn.dataset.url;
                const episodeTitle = btn.parentElement.dataset.episodeTitle;
                
                // Redirect ke halaman watch dengan URL structure
                // Format: /watch.php?anime={anime_title}&ep={episode_url}&series={series_id}
                const animeTitle = this.detailContainer.querySelector('.detail-title')?.textContent || 'anime';
                const encodedEpisodeUrl = encodeURIComponent(episodeUrl);
                const cleanAnimeTitle = animeTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                
                // Get series_id dari anime data
                const seriesData = this.detailContainer.closest('.detail-modal')?.dataset.seriesId || seriesId;
                
                const watchUrl = `/watch.php?anime=${encodeURIComponent(animeTitle)}&ep=${encodedEpisodeUrl}&series=${encodeURIComponent(seriesData)}`;
                window.location.href = watchUrl;
            });
        });
    },
    
    
    // Handle Favorite Button
    handleFavorite(anime) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const exists = favorites.find(f => f.id === anime.id);
        
        if (exists) {
            // Remove from favorites
            const filtered = favorites.filter(f => f.id !== anime.id);
            localStorage.setItem('favorites', JSON.stringify(filtered));
            alert(`❌ "${anime.judul}" dihapus dari favorit`);
        } else {
            // Add to favorites
            favorites.push({
                id: anime.id,
                judul: anime.judul,
                cover: anime.cover,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert(`❤️ "${anime.judul}" ditambahkan ke favorit`);
        }
        
        // Update button state
        const favoriteBtn = this.detailContainer.querySelector('.btn-favorite');
        if (exists) {
            favoriteBtn.classList.remove('active');
        } else {
            favoriteBtn.classList.add('active');
        }
    },
    
    // Handle Share Button
    handleShare(anime) {
        const shareUrl = `${window.location.origin}?anime=${anime.id}`;
        const shareText = `Lihat ${anime.judul} di LieYNime!`;
        
        if (navigator.share) {
            // Native share API
            navigator.share({
                title: 'LieYNime',
                text: shareText,
                url: shareUrl
            }).catch(err => console.log('Share error:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            alert('✅ Link disalin ke clipboard!');
        }
    },
    
    // Show Loading State
    showLoadingState() {
        this.detailContainer.innerHTML = `
            <div class="detail-loading">
                <div class="spinner"></div>
                <p>Memuat detail anime...</p>
            </div>
        `;
    },
    
    // Show Error State
    showErrorState(message) {
        this.detailContainer.innerHTML = `
            <div class="detail-error">
                <p>⚠️ ${message}</p>
                <button onclick="DetailPage.closeModal()" class="btn-close">Tutup</button>
            </div>
        `;
    },
    
    // Close Modal
    closeModal() {
        this.detailModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.detailContainer.innerHTML = '';
    }
};

// Initialize Detail Module on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    DetailPage.init();
});
