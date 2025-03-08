// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    // Dark mode toggle
    const darkModeToggle = document.querySelector('.social-links a:first-child');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            // Save preference to localStorage
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            // Update icon
            updateDarkModeIcon(isDarkMode);
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    // Mobile navigation toggle
    const mobileNavToggle = document.createElement('button');
    mobileNavToggle.className = 'mobile-nav-toggle';
    mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth <= 768) {
        document.querySelector('.content-header').prepend(mobileNavToggle);
        
        mobileNavToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show-mobile');
            this.innerHTML = sidebar.classList.contains('show-mobile') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Add active class to current page in navigation
    highlightCurrentPage();
});

// Function to update dark mode icon
function updateDarkModeIcon(isDarkMode) {
    const darkModeIcon = document.querySelector('.social-links a:first-child i');
    if (darkModeIcon) {
        darkModeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Function to perform search
function performSearch(query) {
    if (!query.trim()) return;
    
    // In a real implementation, this would redirect to a search results page
    // For now, we'll just alert the search query
    alert(`Searching for: ${query}`);
    
    // In a real implementation, you would redirect to a search page:
    // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

// Function to highlight current page in navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href) {
            const itemPath = href.split('/').pop();
            const pagePath = currentPath.split('/').pop() || 'index.html';
            
            if (itemPath === pagePath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// Add dark mode styles dynamically
function applyDarkModeStyles() {
    const darkModeStyles = `
        body.dark-mode {
            background-color: #1a1a1a;
            color: #e0e0e0;
        }
        
        body.dark-mode .sidebar {
            background-color: #252525;
            border-color: #333;
        }
        
        body.dark-mode .nav-item:hover, 
        body.dark-mode .nav-item.active {
            background-color: #333;
        }
        
        body.dark-mode .post,
        body.dark-mode .widget {
            background-color: #252525;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        body.dark-mode .post-title a,
        body.dark-mode .widget-title,
        body.dark-mode .blog-title {
            color: #e0e0e0;
        }
        
        body.dark-mode .post-content,
        body.dark-mode .widget-list li a {
            color: #b0b0b0;
        }
        
        body.dark-mode .tag {
            background-color: #333;
            color: #e0e0e0;
        }
        
        body.dark-mode .content-header {
            border-color: #333;
        }
        
        body.dark-mode .search-input {
            background-color: #333;
            color: #e0e0e0;
            border-color: #444;
        }
        
        body.dark-mode a {
            color: #80b3ff;
        }
        
        body.dark-mode .social-link {
            color: #b0b0b0;
        }
        
        body.dark-mode .social-link:hover {
            color: #e0e0e0;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = darkModeStyles;
    document.head.appendChild(styleElement);
}

// Apply dark mode styles
applyDarkModeStyles();
