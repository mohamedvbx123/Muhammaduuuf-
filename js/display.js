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
            displayPosts(posts);
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

function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.dataset.id = post.id;
        postElement.dataset.hasImage = post.image ? 'true' : 'false';
        postElement.dataset.isFavorite = post.isFavorite ? 'true' : 'false';
        
        let imageHtml = '';
        if (post.image) {
            imageHtml = `<img src="${post.image}" alt="${post.title}" class="post-image">`;
        }
        
        postElement.innerHTML = `
            <h3 class="post-title">${post.title}</h3>
            ${imageHtml}
            <div class="post-content">${post.content}</div>
            <div class="post-date">${post.date}</div>
            <div class="post-actions">
                <button class="action-btn copy-btn" title="نسخ">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn share-btn" title="مشاركة">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="action-btn favorite-btn ${post.isFavorite ? 'favorite' : ''}" title="مفضلة">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        
        container.appendChild(postElement);
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
    
    // أحداث الأزرار
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
            const postTitle = this.closest('.post-card').querySelector('.post-title').textContent;
            const postContent = this.closest('.post-card').querySelector('.post-content').textContent;
            
            if (navigator.share) {
                navigator.share({
                    title: postTitle,
                    text: postContent,
                })
                .then(() => showToast('تمت المشاركة بنجاح'))
                .catch(err => showToast('حدث خطأ أثناء المشاركة'));
            } else {
                const shareUrl = `whatsapp://send?text=${encodeURIComponent(postTitle + '\n\n' + postContent)}`;
                window.open(shareUrl, '_blank');
                showToast('تم فتح تطبيق المشاركة');
            }
        });
    });
    
    // مفضلة
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const postCard = this.closest('.post-card');
            const isFavorite = postCard.dataset.isFavorite === 'true';
            
            postCard.dataset.isFavorite = !isFavorite;
            this.classList.toggle('favorite');
            
            const category = localStorage.getItem('selectedCategory') || 'romantic';
            const postId = postCard.dataset.id;
            
            showToast(isFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة');
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
    
    posts.forEach(post => {
        let shouldShow = true;
        
        switch (filter) {
            case 'text':
                shouldShow = post.dataset.hasImage === 'false';
                break;
            case 'image':
                shouldShow = post.dataset.hasImage === 'true';
                break;
            case 'favorites':
                shouldShow = post.dataset.isFavorite === 'true';
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
