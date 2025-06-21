// تغيير الثيم
document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('night-theme');
    const icon = this.querySelector('i');
    if (document.body.classList.contains('night-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'night');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'day');
    }
});

// التنقل بين الأقسام
function navigateTo(category) {
    localStorage.setItem('selectedCategory', category);
    window.location.href = 'display.html';
}

// تحميل الثيم المحفوظ
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'night') {
        document.body.classList.add('night-theme');
        const icon = document.querySelector('#theme-toggle i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});
