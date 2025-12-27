document.addEventListener('DOMContentLoaded', async () => {
   // الحصول على معلمات URL
   const params = getUrlParams();
   const categoryTag = params.category || 'adab';
   const articleId = params.id || '1';
   
   // تحميل البيانات العامة
   await loadGeneralData();
   
   // تحميل بيانات المجال
   const categoryData = await loadCategoryData(categoryTag);
   
   if (categoryData) {
      // العثور على المقالة
      const article = findArticleInCategory(categoryData, articleId);
      
      if (article) {
         // تحديث عنوان الصفحة
         document.title = `المكتبة الأدبية | ${article.title}`;
         const pageTitle = document.getElementById('articleTitle');
         if (pageTitle) pageTitle.textContent = `المكتبة الأدبية | ${article.title}`;
         
         // عرض المقالة
         displayArticle(article, categoryData);
         
         // تهيئة عناصر التحكم بالصوت (إذا كان هناك صوت)
         initAudioControls(article);
         
         // عرض مقالات ذات صلة
         displayRelatedArticles(article, categoryData);
         
         // تحديث الدراور
         updateDrawer(categoryData);
         
         // تهيئة زر العودة
         initBackButton(categoryTag);
      }
   }
});

// البحث عن مقالة في بيانات المجال
function findArticleInCategory(categoryData, articleId) {
   // التحقق من المقالة المميزة
   if (categoryData.featured && categoryData.featured.id === articleId) {
      return categoryData.featured;
   }
   
   // البحث في الفئات الفرعية
   if (categoryData.subcategories) {
      for (const subcategory of categoryData.subcategories) {
         const article = subcategory.articles.find(a => a.id === articleId);
         if (article) return article;
      }
   }
   
   return null;
}

// عرض المقالة
function displayArticle(article, categoryData) {
   const articleContent = document.getElementById('articleContent');
   if (!articleContent) return;
   
   let html = `
        <div class="text">
            <h1>${article.title}</h1>
            ${article.image ? `
            <div class="image" style="width:100%;height:400px;margin:0 auto 30px;">
                <img src="${article.image}" alt="${article.title}" style="margin-left:0;width:100%;height:100%;">
            </div>
            ` : ''}
            <div class="article-text">
    `;
   
   // تقسيم النص إلى فقرات
   const paragraphs = article.content.split('\n\n');
   paragraphs.forEach(paragraph => {
      html += `<p>${paragraph}</p>`;
   });
   
   html += `</div>`;
   
   // عرض الملاحظات إذا وجدت
   if (article.notes) {
      html += `
            <div class="notes-section">
                <h4><i class="fas fa-sticky-note"></i> ملاحظات</h4>
                <p>${article.notes}</p>
            </div>
        `;
   }
   
   html += `</div>`;
   articleContent.innerHTML = html;
}

// تهيئة عناصر التحكم بالصوت
function initAudioControls(article) {
   const audioControlsContainer = document.getElementById('audioControlsContainer');
   if (!audioControlsContainer) return;
   
   if (article.audio) {
      audioControlsContainer.innerHTML = `
            <div class="audio-controls">
                <h3><i class="fas fa-music"></i> الاستماع للمقالة</h3>
                <div class="audio-player">
                    <button id="playPauseBtn"><i class="fas fa-play"></i></button>
                    <button id="stopBtn"><i class="fas fa-stop"></i></button>
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-bar" id="progressBar"></div>
                    </div>
                    <div class="time-display" id="timeDisplay">00:00 / 00:00</div>
                    <input type="range" id="volumeControl" min="0" max="1" step="0.1" value="0.7" style="width:80px;">
                </div>
            </div>
        `;
      
      const audio = new Audio(article.audio);
      const playPauseBtn = document.getElementById('playPauseBtn');
      const stopBtn = document.getElementById('stopBtn');
      const progressBar = document.getElementById('progressBar');
      const progressContainer = document.getElementById('progressContainer');
      const timeDisplay = document.getElementById('timeDisplay');
      const volumeControl = document.getElementById('volumeControl');
      
      let isPlaying = false;
      
      // تحديث شريط التقدم
      audio.addEventListener('timeupdate', () => {
         const progressPercent = (audio.currentTime / audio.duration) * 100;
         progressBar.style.width = `${progressPercent}%`;
         
         // تحديث الوقت
         const currentMinutes = Math.floor(audio.currentTime / 60);
         const currentSeconds = Math.floor(audio.currentTime % 60);
         const durationMinutes = Math.floor(audio.duration / 60);
         const durationSeconds = Math.floor(audio.duration % 60);
         
         timeDisplay.textContent =
            `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')} / 
                 ${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}`;
      });
      
      // التمرير عند النقر على شريط التقدم
      progressContainer.addEventListener('click', (e) => {
         const clickX = e.offsetX;
         const width = progressContainer.clientWidth;
         const duration = audio.duration;
         
         audio.currentTime = (clickX / width) * duration;
      });
      
      // التحكم في التشغيل/الإيقاف المؤقت
      playPauseBtn.addEventListener('click', () => {
         if (isPlaying) {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
         } else {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
         }
         isPlaying = !isPlaying;
      });
      
      // إيقاف الصوت
      stopBtn.addEventListener('click', () => {
         audio.pause();
         audio.currentTime = 0;
         playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
         isPlaying = false;
      });
      
      // التحكم في مستوى الصوت
      volumeControl.addEventListener('input', (e) => {
         audio.volume = e.target.value;
      });
      
      // عندما ينتهي الصوت
      audio.addEventListener('ended', () => {
         playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
         isPlaying = false;
      });
      
   } else {
      // إخفاء عناصر التحكم إذا لم يكن هناك صوت
      audioControlsContainer.style.display = 'none';
   }
}

// عرض مقالات ذات صلة
function displayRelatedArticles(article, categoryData) {
   const relatedList = document.getElementById('relatedList');
   if (!relatedList || !categoryData.subcategories) return;
   
   let relatedArticles = [];
   
   // جمع المقالات من نفس الفئة الفرعية
   categoryData.subcategories.forEach(subcategory => {
      const articleInSub = subcategory.articles.find(a => a.id === article.id);
      if (articleInSub) {
         // أخذ أول مقالتين أخريين من نفس الفئة الفرعية
         const otherArticles = subcategory.articles
            .filter(a => a.id !== article.id)
            .slice(0, 2);
         relatedArticles.push(...otherArticles);
      }
   });
   
   // إذا لم يكن هناك مقالات ذات صلة، نأخذ مقالات من فئات فرعية أخرى
   if (relatedArticles.length === 0) {
      categoryData.subcategories.forEach(subcategory => {
         if (subcategory.articles && subcategory.articles.length > 0) {
            relatedArticles.push(subcategory.articles[0]);
         }
      });
      relatedArticles = relatedArticles.slice(0, 3);
   }
   
   // عرض المقالات ذات الصلة
   if (relatedArticles.length > 0) {
      relatedList.innerHTML = '';
      
      relatedArticles.forEach(relatedArticle => {
         const card = document.createElement('div');
         card.className = 'article-card';
         
         card.innerHTML = `
                ${relatedArticle.image ? `<img src="${relatedArticle.image}" alt="${relatedArticle.title}">` : ''}
                <div class="article-card-content">
                    <h3>${relatedArticle.title}</h3>
                    <p>${relatedArticle.content.substring(0, 100)}...</p>
                    <a href="${createArticleLink(categoryData.tag, relatedArticle.id)}" class="read-more">
                        اقرأ المقال <i class="fas fa-arrow-left"></i>
                    </a>
                </div>
            `;
         
         relatedList.appendChild(card);
      });
   } else {
      document.getElementById('relatedArticles').style.display = 'none';
   }
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

// تهيئة زر العودة
function initBackButton(categoryTag) {
   const backButton = document.getElementById('backToCategory');
   if (backButton) {
      backButton.addEventListener('click', () => {
         window.location.href = createCategoryLink(categoryTag);
      });
   }
}