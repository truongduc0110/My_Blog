# Personal Blog

A simple, elegant blog built with HTML, CSS, and JavaScript that can be easily deployed to GitHub Pages.

## Features

- Responsive design that works on desktop and mobile devices
- Dark mode toggle
- Search functionality (placeholder for now)
- Clean and modern UI
- Tag cloud for easy navigation
- Sidebar with navigation links
- Detailed post pages with proper formatting for code and images

## Directory Structure

```
My-blog/
├── css/
│   ├── style.css      # Main stylesheet
│   └── post.css       # Additional styles for post pages
├── js/
│   └── script.js      # JavaScript functionality
├── images/
│   └── profile.jpg    # Profile image (add your own)
├── posts/
│   └── overfitting.html # Sample blog post
└── index.html         # Homepage
```

## How to Deploy to GitHub Pages

1. Create a GitHub repository for your blog
2. Push your blog files to the repository

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

3. Go to your repository's Settings tab
4. Scroll down to the "GitHub Pages" section
5. Select the branch you want to deploy (usually `main`)
6. Click Save
7. Your blog will be available at `https://yourusername.github.io/your-repo-name/`

## Customization

### Profile Image

1. Add your profile image to the `images` folder
2. Update the image path in `index.html` and post pages

### Blog Information

1. Update the blog title and subtitle in `index.html` and post pages
2. Customize the navigation links as needed

### Adding New Posts

1. Create a new HTML file in the `posts` folder
2. Copy the structure from an existing post
3. Update the content with your new blog post
4. Add a link to your new post on the homepage

## License

This project is open source and available under the [MIT License](LICENSE).
