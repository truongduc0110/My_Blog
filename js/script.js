// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        updateDarkModeIcon(true);
    }

    // Dark mode toggle
    const darkModeToggle = document.querySelector('.social-links a:first-child');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
            document.body.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
            
            // Save preference to localStorage
            localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
            
            // Update icon
            updateDarkModeIcon(!isDarkMode);
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

    // Initialize category card animations
    initializeCategoryCards();
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

// Function to initialize category card animations
function initializeCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        // Add hover animation
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        });

        // Add click animation
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on a link
            if (e.target.tagName.toLowerCase() === 'a') return;
            
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-5px)';
            }, 100);
        });
    });
}

// Add dark mode styles dynamically
function applyDarkModeStyles() {
    const darkModeStyles = `
        body[data-theme="dark"] {
            background-color: #1a1a1a;
            color: #e0e0e0;
        }
        
        body[data-theme="dark"] .sidebar {
            background-color: #252525;
            border-color: #333;
        }
        
        body[data-theme="dark"] .nav-item:hover, 
        body[data-theme="dark"] .nav-item.active {
            background-color: #333;
        }
        
        body[data-theme="dark"] .post,
        body[data-theme="dark"] .widget {
            background-color: #252525;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        body[data-theme="dark"] .post-title a,
        body[data-theme="dark"] .widget-title,
        body[data-theme="dark"] .blog-title {
            color: #e0e0e0;
        }
        
        body[data-theme="dark"] .post-content,
        body[data-theme="dark"] .widget-list li a {
            color: #b0b0b0;
        }
        
        body[data-theme="dark"] .tag {
            background-color: #333;
            color: #e0e0e0;
        }
        
        body[data-theme="dark"] .content-header {
            border-color: #333;
        }
        
        body[data-theme="dark"] .search-input {
            background-color: #333;
            color: #e0e0e0;
            border-color: #444;
        }
        
        body[data-theme="dark"] a {
            color: #80b3ff;
        }
        
        body[data-theme="dark"] .social-link {
            color: #b0b0b0;
        }
        
        body[data-theme="dark"] .social-link:hover {
            color: #e0e0e0;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = darkModeStyles;
    document.head.appendChild(styleElement);
}

// Apply dark mode styles
applyDarkModeStyles();
