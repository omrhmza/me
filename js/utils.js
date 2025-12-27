let allData = {
   general: null,
   categories: {}
};

// حجم الخط الحالي
let currentFontSize = 16;

// تهيئة الدراور
function initDrawer() {
   const drawerToggle = document.getElementById('drawerToggle');
   const drawerClose = document.getElementById('drawerClose');
   const drawer = document.getElementById('mainDrawer');
   const overlay = document.getElementById('drawerOverlay');
   
   if (drawerToggle && drawer) {
      drawerToggle.addEventListener('click', () => {
         drawer.classList.add('open');
         if (overlay) overlay.classList.add('active');
      });
   }
   
   if (drawerClose) {
      drawerClose.addEventListener('click', () => {
         drawer.classList.remove('open');
         if (overlay) overlay.classList.remove('active');
      });
   }
   
   if (overlay) {
      overlay.addEventListener('click', () => {
         drawer.classList.remove('open');
         overlay.classList.remove('active');
      });
   }
}

// تهيئة البحث
function initSearch() {
   const searchInput = document.getElementById('globalSearch');
   const searchBtn = document.getElementById('searchBtn');
   
   if (searchInput && searchBtn) {
      const performSearch = () => {
         const query = searchInput.value.trim();
         if (query) {
            // بحث في جميع المقالات
            searchArticles(query);
         }
      };
      
      searchBtn.addEventListener('click', performSearch);
      searchInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') performSearch();
      });
   }
}

// وظيفة البحث
async function searchArticles(query) {
   try {
      // تحميل جميع فئات البيانات
      const categories = ['diwani'];
      const results = [];
      
      for (const category of categories) {
         if (!allData.categories[category]) {
            const response = await fetch(`texts/${category}.json`);
            if (response.ok) {
               allData.categories[category] = await response.json();
            }
         }
         
         if (allData.categories[category]) {
            const categoryData = allData.categories[category];
            
            // البحث في المقالة المميزة
            if (categoryData.featured &&
               (categoryData.featured.title.includes(query) ||
                  categoryData.featured.content.includes(query))) {
               results.push({
                  ...categoryData.featured,
                  category: categoryData.tag,
                  categoryName: categoryData.name
               });
            }
            
            // البحث في المقالات الفرعية
            if (categoryData.subcategories) {
               categoryData.subcategories.forEach(sub => {
                  sub.articles.forEach(article => {
                     if (article.title.includes(query) ||
                        article.content.includes(query)) {
                        results.push({
                           ...article,
                           category: categoryData.tag,
                           categoryName: categoryData.name,
                           subcategory: sub.title
                        });
                     }
                  });
               });
            }
         }
      }
      
      // عرض نتائج البحث
      displaySearchResults(results, query);
      
   } catch (error) {
      console.error('خطأ في البحث:', error);
   }
}

// عرض نتائج البحث
function displaySearchResults(results, query) {
   // يمكن تنفيذ هذا حسب احتياجاتك
   console.log(`نتائج البحث عن "${query}":`, results);
   
   // هنا يمكنك إنشاء واجهة لعرض النتائج
   if (results.length === 0) {
      alert(`لا توجد نتائج للبحث عن "${query}"`);
   } else {
      // في حالة بسيطة، نفتح أول نتيجة
      const firstResult = results[0];
      window.location.href = `article.html?category=${firstResult.category}&id=${firstResult.id}`;
   }
}

// تهيئة تحكم الخط
function initFontControls() {
   const fontDecrease = document.getElementById('fontDecrease');
   const fontReset = document.getElementById('fontReset');
   const fontIncrease = document.getElementById('fontIncrease');
   
   if (fontDecrease) {
      fontDecrease.addEventListener('click', () => {
         if (currentFontSize > 12) {
            currentFontSize -= 2;
            updateFontSize();
         }
      });
   }
   
   if (fontReset) {
      fontReset.addEventListener('click', () => {
         currentFontSize = 16;
         updateFontSize();
      });
   }
   
   if (fontIncrease) {
      fontIncrease.addEventListener('click', () => {
         if (currentFontSize < 24) {
            currentFontSize += 2;
            updateFontSize();
         }
      });
   }
}

// تحديث حجم الخط
function updateFontSize() {
   document.body.style.fontSize = `${currentFontSize}px`;
   
   // حفظ التفضيل في localStorage
   localStorage.setItem('fontSize', currentFontSize);
}

// تحميل تفضيل الخط
function loadFontSize() {
   const savedSize = localStorage.getItem('fontSize');
   if (savedSize) {
      currentFontSize = parseInt(savedSize);
      updateFontSize();
   }
}

// تحميل البيانات العامة
async function loadGeneralData() {
   try {
      const response = await fetch('texts/general.json');
      if (response.ok) {
         allData.general = await response.json();
         return allData.general;
      }
   } catch (error) {
      console.error('خطأ في تحميل البيانات العامة:', error);
   }
   return null;
}

// الحصول على معلومات المؤلف
function getAuthorInfo() {
   if (allData.general && allData.general.owner) {
      return allData.general.owner;
   }
   return {
      name: "عبدالله بن محمد",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "كاتب وباحث أدبي، مهتم بالأدب العربي الكلاسيكي والمعاصر."
   };
}

// إنشاء رابط لمقالة
function createArticleLink(category, articleId) {
   return `article.html?category=${category}&id=${articleId}`;
}

// إنشاء رابط لمجال
function createCategoryLink(category) {
   return `category.html?tag=${category}`;
}

// تحميل بيانات مجال معين
async function loadCategoryData(category) {
   try {
      // إذا كانت البيانات مخزنة مسبقًا
      if (allData.categories[category]) {
         return allData.categories[category];
      }
      
      // تحميل البيانات من الملف
      const response = await fetch(`texts/${category}.json`);
      if (response.ok) {
         const data = await response.json();
         allData.categories[category] = data;
         return data;
      }
   } catch (error) {
      console.error(`خطأ في تحميل بيانات المجال ${category}:`, error);
   }
   return null;
}

// الحصول على معلمات URL
function getUrlParams() {
   const params = new URLSearchParams(window.location.search);
   const result = {};
   
   for (const [key, value] of params) {
      result[key] = value;
   }
   
   return result;
}

// تهيئة عامة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
   initDrawer();
   initSearch();
   initFontControls();
   loadFontSize();
});


