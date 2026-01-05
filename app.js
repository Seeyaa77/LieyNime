// API Configuration
const API_BASE_URL = 'https://api.sansekai.my.id/api';
const ANIME_ENDPOINT = '/anime/latest';
const SEARCH_ENDPOINT = '/anime/search';

// State Management
let currentPage = 1;
let isLoading = false;
let isSearchMode = false;
let searchQuery = '';

// DOM Elements
const animeGrid = document.getElementById('animeGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadAnime(currentPage);
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            if (isSearchMode) {
                performSearch(currentPage);
            } else {
                loadAnime(currentPage);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        currentPage++;
        if (isSearchMode) {
            performSearch(currentPage);
        } else {
            loadAnime(currentPage);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        performSearch(currentPage);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            performSearch(currentPage);
        }
    });
}

// Load Anime Data
async function loadAnime(page = 1) {
    if (isLoading) return;

    isLoading = true;
    isSearchMode = false;
    showLoadingSpinner(true);
    clearError();

    try {
        const response = await fetch(`${API_BASE_URL}${ANIME_ENDPOINT}?page=${page}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            showError('Tidak ada data anime tersedia untuk halaman ini');
            prevBtn.disabled = page <= 1;
            nextBtn.disabled = true;
            animeGrid.innerHTML = '';
        } else {
            renderAnimeGrid(data);
            updatePaginationButtons(page, data.length);
        }
    } catch (error) {
        console.error('Error fetching anime:', error);
        showError(`Gagal mengambil data: ${error.message}`);
        animeGrid.innerHTML = '';
    } finally {
        showLoadingSpinner(false);
        isLoading = false;
    }
}

// Render Anime Grid
function renderAnimeGrid(animeList) {
    animeGrid.innerHTML = '';

    animeList.forEach((anime) => {
        const card = createAnimeCard(anime);
        animeGrid.appendChild(card);
    });
}

// Create Anime Card
function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';

    // Handle missing or invalid data
    const title = anime.judul || 'Tidak Ada Judul';
    const cover = anime.cover || 'https://via.placeholder.com/180x250?text=No+Image';
    const score = anime.score || 'N/A';
    const status = anime.status || 'Unknown';
    const genres = Array.isArray(anime.genre) ? anime.genre.filter(g => g) : [];
    const episodes = anime.total_episode || 'N/A';

    const statusClass = status.toLowerCase() === 'completed' ? 'completed' : '';

    card.innerHTML = `
        <img src="${cover}" alt="${title}" class="anime-cover" onerror="this.src='https://via.placeholder.com/180x250?text=No+Image'">
        <div class="anime-info">
            <h3 class="anime-title" title="${title}">${title}</h3>
            <div class="anime-meta">
                <span class="anime-score">${score}</span>
                <span class="anime-status ${statusClass}">${status}</span>
            </div>
            <div class="anime-meta">
                <small>${episodes} Episode</small>
            </div>
            ${genres.length > 0 ? `
                <div class="anime-genres">
                    ${genres.slice(0, 2).map(genre => `
                        <span class="anime-genre">${genre}</span>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    // Add click event to open detail
    card.addEventListener('click', () => {
        DetailPage.openDetail(anime.id, anime);
    });

    return card;
}

// Update Pagination Buttons
function updatePaginationButtons(page, dataLength) {
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = dataLength < 20; // Asumsikan limit 20 per halaman
    pageInfo.textContent = `Halaman ${page}`;
}
async function performSearch(page = 1) {
    const query = searchInput.value.trim();

    if (!query) {
        showError('Masukkan kata kunci pencarian');
        return;
    }

    if (isLoading) return;

    isLoading = true;
    isSearchMode = true;
    searchQuery = query;
    showLoadingSpinner(true);
    clearError();

    try {
        // Use the search endpoint dengan parameter 'query'
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`${API_BASE_URL}${SEARCH_ENDPOINT}?query=${encodedQuery}&page=${page}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('Search Response:', responseData);

        // Handle response structure: { data: [{ jumlah, result, pagination }] }
        if (!responseData.data || responseData.data.length === 0) {
            showError(`Tidak ada hasil untuk "${query}"`);
            animeGrid.innerHTML = '';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            pageInfo.textContent = `Hasil pencarian: 0 anime`;
            return;
        }

        const searchData = responseData.data[0];
        const animeList = searchData.result || [];
        const paginationInfo = searchData.pagination || {};
        const totalResults = searchData.jumlah || 0;

        if (animeList.length === 0) {
            showError(`Tidak ada hasil untuk "${query}"`);
            animeGrid.innerHTML = '';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            pageInfo.textContent = `Hasil pencarian: 0 anime`;
        } else {
            renderAnimeGrid(animeList);
            
            // Update pagination info
            const hasNext = paginationInfo.has_next || false;
            prevBtn.disabled = page <= 1;
            nextBtn.disabled = !hasNext;
            
            pageInfo.textContent = `Hasil "${query}": ${totalResults} anime (Halaman ${page}/${paginationInfo.total_pages || 1})`;
        }
    } catch (error) {
        console.error('Search Error:', error);
        showError(`Gagal mencari anime: ${error.message}`);
        animeGrid.innerHTML = '';
    } finally {
        showLoadingSpinner(false);
        isLoading = false;
    }
}

// Show Loading Spinner
function showLoadingSpinner(show) {
    if (show) {
        loadingSpinner.classList.add('active');
    } else {
        loadingSpinner.classList.remove('active');
    }
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Clear Error Message
function clearError() {
    errorMessage.classList.remove('show');
}
