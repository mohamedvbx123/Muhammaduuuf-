document.addEventListener('DOMContentLoaded', function() {
    // الحصول على القسم المحدد
    const category = localStorage.getItem('selectedCategory') || 'romantic';
    const categoryTitle = document.getElementById('category-title');
    
    // تعيين عنوان القسم
    const categoryTitles = {
        'romantic': 'بوسنات رومانسية',
        'cartoon': 'بوسنات كرتون',
        'religious': 'بوسنات دينية',
        'sad': 'بوسنات حزينة',
        'quotes': 'بوسنات اقتباسات',
        'backup': 'بوسنات احتياطي 1'
    };
    
    categoryTitle.textContent = categoryTitles[category] || 'بوسنات';
    
    // تحميل البوستات
    loadPosts(category);
    
    // إعداد التصفية
    setupFilter();
    
    // تحميل الثيم المحفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'night') {
        document.body.classList.add('night-theme');
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
});

function loadPosts(category) {
    fetch(`posts/${category}.json`)
        .then(response => response.json())
        .then(posts => {
            displayPosts(posts, category);
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById('posts-container').innerHTML = `
                <div class="error-message">
                    حدث خطأ في تحميل البوستات. يرجى المحاولة مرة أخرى.
                </div>
            `;
        });
}

function displayPosts(posts, category) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';
    
    // جلب المفضلة من localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        
        // استخدام الفهرس والمحتوى كمعرف فريد
        const postKey = `${category}_${index}`;
        const isFavorite = favorites[postKey] || false;
        
        let imageHtml = '';
        if (post.image) {
            imageHtml = `<img src="${post.image}" alt="صورة البوست" class="post-image">`;
        }
        
        postElement.innerHTML = `
            ${imageHtml}
            <div class="post-content">${post.content}</div>
            <div class="post-date">${post.date || ''}</div>
            <div class="post-actions">
                <button class="action-btn copy-btn" title="نسخ">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn share-btn" title="مشاركة">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="action-btn favorite-btn ${isFavorite ? 'favorite' : ''}" title="مفضلة">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        
        container.appendChild(postElement);
        
        // إضافة حدث المفضلة
        const favoriteBtn = postElement.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const newFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
            const isCurrentlyFavorite = newFavorites[postKey];
            
            newFavorites[postKey] = !isCurrentlyFavorite;
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            
            this.classList.toggle('favorite');
            showToast(isCurrentlyFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة');
        });
    });
    
    // إضافة أحداث النقر للبوستات
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.action-btn')) return;
            document.querySelectorAll('.post-card').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // إعداد أحداث النسخ والمشاركة
    setupPostButtons();
}

function setupPostButtons() {
    // نسخ
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const postContent = this.closest('.post-card').querySelector('.post-content').textContent;
            navigator.clipboard.writeText(postContent)
                .then(() => showToast('تم النسخ بنجاح'))
                .catch(err => showToast('حدث خطأ أثناء النسخ'));
        });
    });
    
    // مشاركة
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const postContent = this.closest('.post-card').querySelector('.post-content').textContent;
            
            if (navigator.share) {
                navigator.share({
                    text: postContent,
                })
                .then(() => showToast('تمت المشاركة بنجاح'))
                .catch(err => showToast('حدث خطأ أثناء المشاركة'));
            } else {
                const shareUrl = `whatsapp://send?text=${encodeURIComponent(postContent)}`;
                window.open(shareUrl, '_blank');
                showToast('تم فتح تطبيق المشاركة');
            }
        });
    });
}

function setupFilter() {
    const filterBtn = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    
    filterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        filterDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function() {
        filterDropdown.classList.remove('show');
    });
    
    filterDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function() {
            const filter = this.dataset.filter;
            applyFilter(filter);
            filterDropdown.classList.remove('show');
        });
    });
}

function applyFilter(filter) {
    const posts = document.querySelectorAll('.post-card');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const category = localStorage.getItem('selectedCategory') || 'romantic';
    
    posts.forEach((post, index) => {
        let shouldShow = true;
        const postKey = `${category}_${index}`;
        
        switch (filter) {
            case 'text':
                shouldShow = !post.querySelector('.post-image');
                break;
            case 'image':
                shouldShow = post.querySelector('.post-image');
                break;
            case 'favorites':
                shouldShow = favorites[postKey];
                break;
            case 'recent':
                // يمكن تطبيق منطق للتاريخ هنا
                break;
        }
        
        post.style.display = shouldShow ? 'block' : 'none';
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function goBack() {
    window.history.back();
}document.addEventListener('DOMContentLoaded', function() {
    // الحصول على القسم المحدد
    const category = localStorage.getItem('selectedCategory') || 'romantic';
    const categoryTitle = document.getElementById('category-title');
    
    // تعيين عنوان القسم
    const categoryTitles = {
        'romantic': 'بوسنات رومانسية',
        'cartoon': 'بوسنات كرتون',
        'religious': 'بوسنات دينية',
        'sad': 'بوسنات حزينة',
        'quotes': 'بوسنات اقتباسات',
        'backup': 'بوسنات احتياطي 1'
    };
    
    categoryTitle.textContent = categoryTitles[category] || 'بوسنات';
    
    // تحميل البوستات
    loadPosts(category);
    
    // إعداد التصفية
    setupFilter();
    
    // تحميل الثيم المحفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'night') {
        document.body.classList.add('night-theme');
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
});

function loadPosts(category) {
    fetch(`posts/${category}.json`)
        .then(response => response.json())
        .then(posts => {
            displayPosts(posts, category);
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById('posts-container').innerHTML = `
                <div class="error-message">
                    حدث خطأ في تحميل البوستات. يرجى المحاولة مرة أخرى.
                </div>
            `;
        });
}

function displayPosts(posts, category) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';
    
    // جلب المفضلة من localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        
        // استخدام الفهرس والمحتوى كمعرف فريد
        const postKey = `${category}_${index}`;
        const isFavorite = favorites[postKey] || false;
        
        let imageHtml = '';
        if (post.image) {
            imageHtml = `<img src="${post.image}" alt="صورة البوست" class="post-image">`;
        }
        
        postElement.innerHTML = `
            ${imageHtml}
            <div class="post-content">${post.content}</div>
            <div class="post-date">${post.date || ''}</div>
            <div class="post-actions">
                <button class="action-btn copy-btn" title="نسخ">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn share-btn" title="مشاركة">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="action-btn favorite-btn ${isFavorite ? 'favorite' : ''}" title="مفضلة">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        
        container.appendChild(postElement);
        
        // إضافة حدث المفضلة
        const favoriteBtn = postElement.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const newFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
            const isCurrentlyFavorite = newFavorites[postKey];
            
            newFavorites[postKey] = !isCurrentlyFavorite;
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            
            this.classList.toggle('favorite');
            showToast(isCurrentlyFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة');
        });
    });
    
    // إضافة أحداث النقر للبوستات
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.action-btn')) return;
            document.querySelectorAll('.post-card').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // إعداد أحداث النسخ والمشاركة
    setupPostButtons();
}

function setupPostButtons() {
    // نسخ
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const postContent = this.closest('.post-card').querySelector('.post-content').textContent;
            navigator.clipboard.writeText(postContent)
                .then(() => showToast('تم النسخ بنجاح'))
                .catch(err => showToast('حدث خطأ أثناء النسخ'));
        });
    });
    
    // مشاركة
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const postContent = this.closest('.post-card').querySelector('.post-content').textContent;
            
            if (navigator.share) {
                navigator.share({
                    text: postContent,
                })
                .then(() => showToast('تمت المشاركة بنجاح'))
                .catch(err => showToast('حدث خطأ أثناء المشاركة'));
            } else {
                const shareUrl = `whatsapp://send?text=${encodeURIComponent(postContent)}`;
                window.open(shareUrl, '_blank');
                showToast('تم فتح تطبيق المشاركة');
            }
        });
    });
}

function setupFilter() {
    const filterBtn = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    
    filterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        filterDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function() {
        filterDropdown.classList.remove('show');
    });
    
    filterDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function() {
            const filter = this.dataset.filter;
            applyFilter(filter);
            filterDropdown.classList.remove('show');
        });
    });
}

function applyFilter(filter) {
    const posts = document.querySelectorAll('.post-card');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const category = localStorage.getItem('selectedCategory') || 'romantic';
    
    posts.forEach((post, index) => {
        let shouldShow = true;
        const postKey = `${category}_${index}`;
        
        switch (filter) {
            case 'text':
                shouldShow = !post.querySelector('.post-image');
                break;
            case 'image':
                shouldShow = post.querySelector('.post-image');
                break;
            case 'favorites':
                shouldShow = favorites[postKey];
                break;
            case 'recent':
                // يمكن تطبيق منطق للتاريخ هنا
                break;
        }
        
        post.style.display = shouldShow ? 'block' : 'none';
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function goBack() {
    window.history.back();
                }
