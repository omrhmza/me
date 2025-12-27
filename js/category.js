document.addEventListener('DOMContentLoaded', async () => {
   // الحصول على معلمات URL
   const params = getUrlParams();
   const categoryTag = params.tag || 'adab';
   
   // تحميل البيانات العامة
   await loadGeneralData();
   
   // تحميل بيانات المجال
   const categoryData = await loadCategoryData(categoryTag);
   
   if (categoryData) {
      // تحديث عنوان الصفحة
      document.title = `المكتبة الأدبية | ${categoryData.name}`;
      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) pageTitle.textContent = `المكتبة الأدبية | ${categoryData.name}`;
      
      // عرض المقالة المميزة
      displayFeaturedArticle(categoryData);
      
      // عرض القوائم الأفقية للعناوين الفرعية
      displaySubcategories(categoryData);
      
      // تحديث الدراور
      updateDrawer(categoryData);
   }
});

// عرض المقالة المميزة
function displayFeaturedArticle(categoryData) {
   const featuredSection = document.getElementById('featuredArticle');
   if (!featuredSection || !categoryData.featured) return;
   
   const article = categoryData.featured;
   
   featuredSection.innerHTML = `
        <div class="row">
            ${article.image ? `
            <div class="image">
                <img src="${article.image}" alt="${article.title}">
            </div>
            ` : ''}
            <div class="text">
                <h2>${article.title}</h2>
                <p class="subtext">${categoryData.description}</p>
                <p class="subtext">${article.content.substring(0, 300)}...</p>
                <div style="margin-top:20px;">
                    <a href="${createArticleLink(categoryData.tag, article.id)}" class="read-more" style="width:200px;display:inline-block;">
                        اقرأ المقالة المميزة <i class="fas fa-arrow-left"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// عرض القوائم الأفقية للعناوين الفرعية
function displaySubcategories(categoryData) {
   const subcategoriesSection = document.getElementById('subcategoriesSection');
   if (!subcategoriesSection || !categoryData.subcategories) return;
   
   let html = `
        <b><i class="fas fa-list"></i> ${categoryData.name}</b>
        <hr class="section-line">
        <div class="horizontal-lists">
    `;
   
   categoryData.subcategories.forEach(subcategory => {
      html += `
            <div class="subcategory-section">
                <h3 class="subcategory-title">
                    <i class="fas fa-bookmark"></i> ${subcategory.title}
                </h3>
                <div class="articles-horizontal">
        `;
      
      subcategory.articles.forEach(article => {
         html += `
                <div class="article-horizontal-item">
                    <h4>${article.title}</h4>
                    <p>${article.content.substring(0, 150)}...</p>
                    ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px;">` : ''}
                    <a href="${createArticleLink(categoryData.tag, article.id)}" class="read-more" style="padding:8px 15px;font-size:14px;">
                        اقرأ المقال <i class="fas fa-arrow-left"></i>
                    </a>
                </div>
            `;
      });
      
      html += `
                </div>
            </div>
        `;
   });
   
   html += `</div>`;
   subcategoriesSection.innerHTML = html;
}

// تحديث الدراور
function updateDrawer(categoryData) {
   const currentTagsSection = document.getElementById('currentTags');
   const allCategoriesList = document.getElementById('allCategories');
   
   // تحديث التصنيف الحالي
   if (currentTagsSection && categoryData) {
      currentTagsSection.innerHTML = '';
      
      const tagElement = document.createElement('span');
      tagElement.className = 'tag';
      tagElement.textContent = categoryData.name;
      tagElement.style.background = 'linear-gradient(135deg, rgba(187, 52, 85, 0.4), rgba(153, 47, 72, 0.4))';
      
      currentTagsSection.appendChild(tagElement);
   }
   
   // تحديث جميع المجالات
   if (allCategoriesList && allData.general && allData.general.tags) {
      allCategoriesList.innerHTML = '';
      
      allData.general.tags.forEach(tag => {
         const li = document.createElement('li');
         li.innerHTML = `<i class="fas fa-folder"></i> ${tag.name}`;
         
         if (tag.id === categoryData.tag) {
            li.style.background = 'rgba(187, 52, 85, 0.3)';
         }
         
         li.addEventListener('click', () => {
            window.location.href = createCategoryLink(tag.id);
         });
         
         allCategoriesList.appendChild(li);
      });
   }
}