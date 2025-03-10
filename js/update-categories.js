/**
 * Script tự động cập nhật các trang danh mục (categories) dựa trên bài viết mới
 * 
 * Cách sử dụng:
 * 1. Cài đặt cheerio: npm install cheerio
 * 2. Thêm bài viết mới vào thư mục posts/[tên-danh-mục]/
 * 3. Chạy script này: node js/update-categories.js
 * 4. Các trang danh mục sẽ được tự động cập nhật theo thứ tự ngày tháng
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Cấu hình
const config = {
    postsDir: path.join(__dirname, '..', 'posts'),
    categoriesDir: path.join(__dirname, '..', 'categories'),
    categoriesIndexFile: path.join(__dirname, '..', 'categories.html'),
    templateFile: path.join(__dirname, '..', 'templates', 'post-template.html'),
    // Map giữa tên thư mục và đường dẫn file category
    categoryMap: {
        'Machine Learning': 'machine-learning',
        'Deep learning': 'deep-learning',
        'Mlops': 'mlops',
        'NLP': 'nlp',
        'Tản Mạn': 'tan-man'
    },
    // Map cho reverse lookup từ đường dẫn file category đến tên thư mục
    reverseCategoryMap: {
        'machine-learning': 'Machine Learning',
        'deep-learning': 'Deep learning',
        'mlops': 'Mlops',
        'nlp': 'NLP',
        'tan-man': 'Tản Mạn'
    }
};

// Kiểm tra và tạo thư mục nếu chưa tồn tại
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.log(`Tạo thư mục mới: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Hàm đọc metadata từ file HTML
function extractPostMetadata(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);
        
        // Nếu file trống hoặc không có cấu trúc đúng, trả về null
        if (!$('.post-title').length || !$('.post-meta').length) {
            return null;
        }
        
        const title = $('.post-title').first().text().trim();
        
        // Lấy ngày tháng từ metadata
        let dateText = $('.post-meta .fa-calendar').parent().text().trim();
        if (!dateText) return null;
        
        dateText = dateText.replace('calendar', '').trim();
        
        // Chuyển đổi ngày tháng thành đối tượng Date
        try {
            const dateParts = dateText.split(' ');
            const month = getMonthNumber(dateParts[0]);
            const day = parseInt(dateParts[1].replace(',', ''));
            const year = parseInt(dateParts[2]);
            const date = new Date(year, month - 1, day);
            
            // Lấy các thẻ tags
            const tags = [];
            $('.post-meta .fa-tags').parent().find('a').each(function() {
                tags.push($(this).text().trim());
            });
            
            const relativePath = path.relative(path.join(__dirname, '..'), filePath)
                                .replace(/\\/g, '/'); // Đổi dấu \ thành / cho URL
            
            return {
                title,
                date,
                dateText,
                tags,
                path: '/' + relativePath,
                category: path.basename(path.dirname(filePath))
            };
        } catch (error) {
            console.error(`Lỗi khi xử lý ngày tháng cho file ${filePath}:`, error);
            return null;
        }
    } catch (error) {
        console.error(`Lỗi khi đọc file ${filePath}:`, error);
        return null;
    }
}

// Hàm chuyển đổi tên tháng thành số
function getMonthNumber(monthName) {
    const months = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };
    return months[monthName] || 1;
}

// Hàm quét tất cả bài viết trong thư mục posts
function scanAllPosts() {
    const allPosts = [];
    const categoryCounts = {};
    
    // Đảm bảo thư mục posts tồn tại
    ensureDirectoryExists(config.postsDir);
    
    // Đảm bảo tất cả các thư mục danh mục đều tồn tại
    Object.keys(config.categoryMap).forEach(categoryKey => {
        const categoryDir = path.join(config.postsDir, categoryKey);
        ensureDirectoryExists(categoryDir);
        categoryCounts[categoryKey] = 0; // Khởi tạo số lượng bài viết là 0
    });
    
    // Đọc tất cả các thư mục con trong thư mục posts
    const categoryDirs = fs.readdirSync(config.postsDir);
    
    categoryDirs.forEach(categoryDir => {
        const categoryPath = path.join(config.postsDir, categoryDir);
        
        // Kiểm tra nếu là thư mục
        if (fs.statSync(categoryPath).isDirectory()) {
            // Đọc tất cả các file HTML trong thư mục danh mục
            let postFiles = [];
            try {
                postFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.html'));
            } catch (error) {
                console.error(`Lỗi khi đọc thư mục ${categoryPath}:`, error);
                return;
            }
            
            // Cập nhật số lượng bài viết trong danh mục
            categoryCounts[categoryDir] = postFiles.length;
            
            postFiles.forEach(postFile => {
                const postPath = path.join(categoryPath, postFile);
                const metadata = extractPostMetadata(postPath);
                
                if (metadata) {
                    allPosts.push(metadata);
                }
            });
        }
    });
    
    // Sắp xếp bài viết theo ngày tháng giảm dần (mới nhất trước)
    allPosts.sort((a, b) => b.date - a.date);
    
    return { allPosts, categoryCounts };
}

// Hàm cập nhật file HTML của trang danh mục
function updateCategoryPage(categoryKey, posts) {
    const categorySlug = config.categoryMap[categoryKey];
    if (!categorySlug) {
        console.warn(`Không tìm thấy đường dẫn cho danh mục ${categoryKey}`);
        return;
    }
    
    const categoryFile = path.join(config.categoriesDir, `${categorySlug}.html`);
    
    // Kiểm tra xem file category có tồn tại không
    if (!fs.existsSync(categoryFile)) {
        console.warn(`File danh mục ${categoryFile} không tồn tại, bỏ qua.`);
        return;
    }
    
    try {
        // Đọc file HTML hiện tại
        const html = fs.readFileSync(categoryFile, 'utf8');
        const $ = cheerio.load(html);
        
        // Lọc các bài viết thuộc danh mục hiện tại
        const categoryPosts = posts.filter(post => post.category === categoryKey);
        
        // Xóa danh sách bài viết cũ
        $('.post-list').empty();
        
        // Thêm các bài viết mới
        categoryPosts.forEach(post => {
            $('.post-list').append(`
                <li class="post-item">
                    <a href="${post.path}" class="post-title">${post.title}</a>
                    <div class="dotted-line"></div>
                    <span class="post-date">${post.dateText}</span>
                </li>
            `);
        });
        
        // Ghi lại file HTML
        fs.writeFileSync(categoryFile, $.html());
        console.log(`Đã cập nhật trang danh mục ${categoryKey}`);
        
    } catch (error) {
        console.error(`Lỗi khi cập nhật trang danh mục ${categoryKey}:`, error);
    }
}

// Hàm cập nhật trang categories.html
function updateCategoriesPage(categoryCounts) {
    try {
        // Đọc file HTML hiện tại
        const html = fs.readFileSync(config.categoriesIndexFile, 'utf8');
        const $ = cheerio.load(html);
        
        // Cập nhật số lượng bài viết cho từng danh mục
        Object.keys(categoryCounts).forEach(categoryKey => {
            const categoryId = config.categoryMap[categoryKey];
            if (categoryId) {
                const count = categoryCounts[categoryKey];
                $(`#${categoryId.replace(/-/g, '_')} .post-count`).text(`${count} posts`);
            }
        });
        
        // Ghi lại file HTML
        fs.writeFileSync(config.categoriesIndexFile, $.html());
        console.log('Đã cập nhật trang categories.html');
        
    } catch (error) {
        console.error('Lỗi khi cập nhật trang categories.html:', error);
    }
}

// Hàm tạo một file template mới
function createTemplateForCategory(categoryDir) {
    // Đảm bảo thư mục tồn tại
    const categoryPath = path.join(config.postsDir, categoryDir);
    ensureDirectoryExists(categoryPath);
    
    // Lấy tên hiển thị của danh mục
    const categoryKey = categoryDir;
    const categorySlug = config.categoryMap[categoryKey];
    
    if (!categorySlug) {
        console.warn(`Không tìm thấy slug cho danh mục ${categoryKey}, bỏ qua việc tạo template.`);
        return;
    }
    
    // Đọc nội dung template
    try {
        if (!fs.existsSync(config.templateFile)) {
            console.warn('File template không tồn tại, không thể tạo template mới.');
            return;
        }
        
        console.log(`Tạo file template mẫu cho danh mục ${categoryKey}...`);
        
        // Tạo tên file ví dụ
        const examplePostName = `example-${Date.now()}.html`;
        const examplePostPath = path.join(categoryPath, examplePostName);
        
        // Kiểm tra xem file đã tồn tại chưa
        if (fs.existsSync(examplePostPath)) {
            console.log(`File ${examplePostPath} đã tồn tại, bỏ qua.`);
            return;
        }
        
        // Đọc template
        let templateContent = fs.readFileSync(config.templateFile, 'utf8');
        
        // Thay thế các placeholder trong template
        const today = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateStr = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
        
        templateContent = templateContent
            .replace(/POST_TITLE/g, 'Example Post Title')
            .replace(/CATEGORY_PATH/g, categorySlug)
            .replace(/CATEGORY_NAME/g, categoryKey)
            .replace(/POST_DATE/g, dateStr);
        
        // Ghi file template vào thư mục danh mục
        fs.writeFileSync(examplePostPath, templateContent);
        console.log(`Đã tạo file template mẫu: ${examplePostPath}`);
        
    } catch (error) {
        console.error(`Lỗi khi tạo template cho danh mục ${categoryKey}:`, error);
    }
}

// Hàm kiểm tra và cập nhật cấu trúc thư mục posts
function checkAndUpdatePostsStructure() {
    console.log('Kiểm tra và cập nhật cấu trúc thư mục posts...');
    
    // Đảm bảo thư mục posts tồn tại
    ensureDirectoryExists(config.postsDir);
    
    // Lấy danh sách các danh mục hiện có
    const existingCategories = fs.readdirSync(config.postsDir)
        .filter(item => fs.statSync(path.join(config.postsDir, item)).isDirectory());
    
    // Kiểm tra từng danh mục đã định nghĩa trong config
    Object.keys(config.categoryMap).forEach(categoryKey => {
        // Kiểm tra xem danh mục có tồn tại không
        if (!existingCategories.includes(categoryKey)) {
            // Nếu chưa tồn tại, tạo thư mục mới
            const categoryPath = path.join(config.postsDir, categoryKey);
            ensureDirectoryExists(categoryPath);
            console.log(`Đã tạo thư mục danh mục mới: ${categoryPath}`);
            
            // Tạo file template mẫu cho danh mục mới
            createTemplateForCategory(categoryKey);
        } else {
            // Nếu đã tồn tại, kiểm tra số lượng bài viết
            const postFiles = fs.readdirSync(path.join(config.postsDir, categoryKey))
                .filter(file => file.endsWith('.html'));
            
            // Nếu không có bài viết nào, tạo file template mẫu
            if (postFiles.length === 0) {
                createTemplateForCategory(categoryKey);
            }
        }
    });
    
    console.log('Hoàn thành kiểm tra và cập nhật cấu trúc thư mục posts!');
}

// Hàm chính
function main() {
    console.log('Bắt đầu cập nhật trang danh mục...');
    
    // Kiểm tra và cập nhật cấu trúc thư mục posts
    checkAndUpdatePostsStructure();
    
    // Quét tất cả bài viết
    const { allPosts, categoryCounts } = scanAllPosts();
    console.log(`Đã tìm thấy ${allPosts.length} bài viết.`);
    
    // Cập nhật các trang danh mục
    Object.keys(config.categoryMap).forEach(category => {
        updateCategoryPage(category, allPosts);
    });
    
    // Cập nhật trang categories.html
    updateCategoriesPage(categoryCounts);
    
    console.log('Hoàn thành cập nhật trang danh mục!');
}

// Chạy hàm chính
main();
