/**
 * PDP Image Gallery Controller
 */
export function initGallery(images = []) {
  const mainBox = document.getElementById('product-main-gallery');
  const thumbsBox = document.getElementById('product-thumbs-gallery');
  
  if (!mainBox || !thumbsBox) return;

  if (images.length === 0) {
    mainBox.innerHTML = `<img class="gallery-main-img" src="/public/assets/images/placeholder.png" alt="Placeholder image">`;
    thumbsBox.innerHTML = '';
    return;
  }

  // 1. Initialise main image display
  const firstImg = images[0].image;
  mainBox.innerHTML = `
    <picture>
      <source id="pdp-main-webp" srcset="/${firstImg}" type="image/webp">
      <img id="pdp-main-img" class="gallery-main-img" src="/${firstImg}" alt="Main product showcase">
    </picture>
  `;

  // 2. Initialise thumbnails list
  thumbsBox.innerHTML = images.map((img, idx) => `
    <button class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}" aria-label="Thumbnail image item ${idx + 1}">
      <img src="/${img.image}" alt="Thumbnail">
    </button>
  `).join('');

  // 3. Bind thumbnail clicks
  thumbsBox.querySelectorAll('.gallery-thumb-item').forEach(btn => {
    btn.addEventListener('click', () => {
      thumbsBox.querySelectorAll('.gallery-thumb-item').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');

      const index = Number(btn.getAttribute('data-idx'));
      const activePath = images[index].image;
      
      const mainImg = document.getElementById('pdp-main-img');
      const webpSrc = document.getElementById('pdp-main-webp');

      if (mainImg) mainImg.src = '/' + activePath;
      if (webpSrc) webpSrc.srcset = '/' + activePath;
    });
  });
}
