document.addEventListener('DOMContentLoaded', async () => {
   // تحميل البيانات العامة
   await loadGeneralData();
   
   // تحديث معلومات المؤلف
   updateAuthorInfo();
   
   // تحميل وعرض التاغات
   await loadAndDisplayTags();
   
   // تحميل وعرض المقالات المميزة
   await loadAndDisplayFeaturedArticles();
   
   // تحديث الدراور
   updateDrawer();
});

// تحديث معلومات المؤلف
function updateAuthorInfo() {
   const authorInfo = getAuthorInfo();
   
   const authorImage = document.getElementById('authorImage');
   const authorName = document.getElementById('authorName');
   const authorBio = document.getElementById('authorBio');
   
   if (authorImage && authorInfo.image) {
      authorImage.src = authorInfo.image;
      authorImage.alt = `صورة ${authorInfo.name}`;
   }
   
   if (authorName) authorName.textContent = authorInfo.name;
   if (authorBio) authorBio.textContent = authorInfo.bio;
}

// تحميل وعرض التاغات
async function loadAndDisplayTags() {
   const tagsContainer = document.getElementById('tagsContainer');
   if (!tagsContainer) return;
   
   if (!allData.general) {
      await loadGeneralData();
   }
   
   if (allData.general && allData.general.tags) {
      allData.general.tags.forEach(tag => {
         const tagElement = document.createElement('div');
         tagElement.className = 'tag-large';
         tagElement.innerHTML = `
                <i class="fas fa-folder"></i>
                <span>${tag.name}</span>
                <small>${getCategoryCount(tag.id)} مقالة</small>
            `;
         
         tagElement.addEventListener('click', () => {
            window.location.href = createCategoryLink(tag.id);
         });
         
         tagsContainer.appendChild(tagElement);
      });
   }
}

// الحصول على عدد المقالات في مجال معين
async function getCategoryCount(categoryId) {
   try {
      const data = await loadCategoryData(categoryId);
      if (data && data.subcategories) {
         let count = data.featured ? 1 : 0;
         data.subcategories.forEach(sub => {
            count += sub.articles.length;
         });
         return count;
      }
   } catch (error) {
      console.error('خطأ في حساب عدد المقالات:', error);
   }
   return 0;
}

// تحميل وعرض المقالات المميزة
async function loadAndDisplayFeaturedArticles() {
   const featuredContainer = document.getElementById('featuredArticles');
   if (!featuredContainer) return;
   
   if (!allData.general) {
      await loadGeneralData();
   }
   
   if (allData.general && allData.general.tags) {
      // عرض مقالتين من كل مجال
      for (const tag of allData.general.tags.slice(0, 3)) {
         const categoryData = await loadCategoryData(tag.id);
         if (categoryData) {
            // المقالة المميزة
            if (categoryData.featured) {
               featuredContainer.appendChild(
                  createArticleCard(categoryData.featured, tag.id, tag.name, true)
               );
            }
            
            // أول مقالة من أول فئة فرعية
            if (categoryData.subcategories && categoryData.subcategories.length > 0) {
               const firstSub = categoryData.subcategories[0];
               if (firstSub.articles && firstSub.articles.length > 0) {
                  featuredContainer.appendChild(
                     createArticleCard(firstSub.articles[0], tag.id, tag.name)
                  );
               }
            }
         }
      }
   }
}

// إنشاء بطاقة مقالة
function createArticleCard(article, category, categoryName, isFeatured = false) {
   const card = document.createElement('div');
   card.className = 'article-card';
   
   card.innerHTML = `
        ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
        <div class="article-card-content">
            ${isFeatured ? '<span class="featured-badge" style="background:#BB3455;color:white;padding:5px 10px;border-radius:15px;font-size:12px;margin-bottom:10px;display:inline-block;">مميزة</span>' : ''}
            <h3>${article.title}</h3>
            <p>${article.content.substring(0, 150)}...</p>
            <small style="color:#888;display:block;margin-bottom:10px;">${categoryName}</small>
            <a href="${createArticleLink(category, article.id)}" class="read-more">
                اقرأ المزيد <i class="fas fa-arrow-left"></i>
            </a>
        </div>
    `;
   
   return card;
}

// تحديث الدراور
function updateDrawer() {
   const allCategoriesList = document.getElementById('allCategories');
   const currentTagsSection = document.getElementById('currentTags');
   
   if (!allCategoriesList && !currentTagsSection) return;
   
   // تحديث جميع المجالات في الدراور
   if (allCategoriesList && allData.general && allData.general.tags) {
      allCategoriesList.innerHTML = '';
      
      allData.general.tags.forEach(tag => {
         const li = document.createElement('li');
         li.innerHTML = `<i class="fas fa-folder"></i> ${tag.name}`;
         
         li.addEventListener('click', () => {
            window.location.href = createCategoryLink(tag.id);
         });
         
         allCategoriesList.appendChild(li);
      });
   }
   
   // في الصفحة الرئيسية، نعرض كل التاغات في قسم "التصنيف الحالي"
   if (currentTagsSection && allData.general && allData.general.tags) {
      currentTagsSection.innerHTML = '';
      
      allData.general.tags.forEach(tag => {
         const tagElement = document.createElement('span');
         tagElement.className = 'tag';
         tagElement.textContent = tag.name;
         
         tagElement.addEventListener('click', () => {
            window.location.href = createCategoryLink(tag.id);
         });
         
         currentTagsSection.appendChild(tagElement);
      });
   }
}

// إخفاء عناصر small فقط داخل قسم التصنيفات
function hideSmallInTags() {
    const tagsContainer = document.getElementById('tagsContainer');
    
    if (tagsContainer) {
        // إخفاء جميع عناصر small داخل tagsContainer فقط
        const smallElements = tagsContainer.querySelectorAll('small');
        smallElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // أو يمكنك إخفائها بالكلاس إذا كان لديك كلاس محدد
        document.querySelectorAll('.tag-large small').forEach(element => {
            element.style.display = 'none';
        });
    }
}

// تشغيل الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // ... كودك الحالي ...
    
    // إضافة هذا السطر
    hideSmallInTags();
});

// تأكيد الإخفاء بعد تحميل المحتوى الديناميكي
setTimeout(hideSmallInTags, 500);