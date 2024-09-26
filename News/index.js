// Your API key
const apiKey = '782fe992ebd918c72f8ee648d0b33026';

// Base URL for the MediaStack API
const apiUrl = `http://api.mediastack.com/v1/news?access_key=${apiKey}&countries=us&languages=en&limit=20`; // 20 articles per page

let currentPage = 1; // Start at page 1
let totalPages = 1; // Will be updated when total results are fetched from the API
const visiblePages = 3; // Only show 3 page numbers at a time

// Default placeholder image
const defaultImageUrl = 'NoImage.webp';

// Function to load news based on the selected category and page number
function loadNews(category = 'general', page = 1) {
    // Adjust API URL to include page offset (20 articles per page)
    const offset = (page - 1) * 20;
    const apiUrlWithPagination = `${apiUrl}&categories=${category}&offset=${offset}`;

    // Create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrlWithPagination, true);

    xhr.onload = function() {
        if (this.status === 200) {
            const response = JSON.parse(this.responseText);
            const newsArticles = response.data;

            const newsContainer = document.getElementById('news-container');
            newsContainer.innerHTML = ''; // Clear any existing content

            // Iterate through the news articles
            newsArticles.forEach(article => {
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');

                // Check if article image is available, if not, use the placeholder
                const imageUrl = article.image ? article.image : defaultImageUrl;

                // Create the HTML for each news item
                newsItem.innerHTML = `
                    <img src="${imageUrl}" alt="${article.title}" class="news-image">
                    <h3>${article.title}</h3>
                    <p>${article.description ? article.description : 'No description available'}</p>
                    <a href="${article.url}" target="_blank" class="read-more">Read More</a>
                `;
                newsContainer.appendChild(newsItem);
            });

            // Update pagination after loading news
            updatePagination(response.pagination.total);
        } else {
            console.error('Failed to fetch news');
        }
    };

    xhr.onerror = function() {
        console.error('Request error...');
    };

    // Send the request
    xhr.send();
}

// Function to update pagination controls with dynamic page number shifts
function updatePagination(totalResults) {
    totalPages = Math.ceil(totalResults / 20); // Assuming 20 results per page
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; // Clear any existing pagination

    const startPage = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
    const endPage = Math.min(startPage + visiblePages - 1, totalPages);

    // Previous button
    if (currentPage > 1) {
        const prevItem = document.createElement('span');
        prevItem.classList.add('pagination-item');
        prevItem.innerText = '«';
        prevItem.addEventListener('click', function() {
            currentPage--;
            loadNews('general', currentPage);
        });
        paginationContainer.appendChild(prevItem);
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('span');
        pageItem.classList.add('pagination-item');
        pageItem.innerText = i;

        // Highlight the current page
        if (i === currentPage) {
            pageItem.classList.add('active');
        }

        // Add click event to change page
        pageItem.addEventListener('click', function() {
            currentPage = i;
            loadNews('general', currentPage); // Reload news for selected page
        });

        paginationContainer.appendChild(pageItem);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextItem = document.createElement('span');
        nextItem.classList.add('pagination-item');
        nextItem.innerText = '»';
        nextItem.addEventListener('click', function() {
            currentPage++;
            loadNews('general', currentPage);
        });
        paginationContainer.appendChild(nextItem);
    }
}

// Function to handle navigation and load news by category
function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            // Get the category from the link text (lowercase)
            const category = this.innerText.toLowerCase();

            // Reset current page to 1 when changing categories
            currentPage = 1;

            // Load the news for the selected category
            loadNews(category, currentPage);
        });
    });
}

// Load general news on page load
window.onload = function() {
    loadNews('general', currentPage); // Default to general news on page 1
    handleNavigation();  // Set up navigation events
};
