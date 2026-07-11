/**
 * Share Buttons Module
 * 
 * Renders and wires up social share + copy-link buttons on the PDP.
 * Uses the native Web Share API (if available) with fallback to
 * clipboard copy and individual social links.
 */

export function initShareButtons(productName, productUrl) {
  const shareNativeBtn  = document.getElementById('share-native-btn');
  const shareCopyBtn    = document.getElementById('share-copy-btn');
  const shareWaBtn      = document.getElementById('share-wa-btn');
  const shareTwBtn      = document.getElementById('share-tw-btn');
  const shareFbBtn      = document.getElementById('share-fb-btn');
  const shareMailBtn    = document.getElementById('share-mail-btn');

  const url   = productUrl || window.location.href;
  const title = productName || document.title;

  // Native Share API (mobile / modern browsers)
  if (shareNativeBtn) {
    if (navigator.share) {
      shareNativeBtn.style.display = 'inline-flex';
      shareNativeBtn.addEventListener('click', async () => {
        try {
          await navigator.share({ title, url, text: `Check out this product: ${title}` });
        } catch (_) {
          // User cancelled — no-op
        }
      });
    } else {
      shareNativeBtn.style.display = 'none';
    }
  }

  // Copy Link
  if (shareCopyBtn) {
    shareCopyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        const original = shareCopyBtn.innerHTML;
        shareCopyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Copied!`;
        setTimeout(() => { shareCopyBtn.innerHTML = original; }, 2000);
      } catch (_) {
        prompt('Copy this link:', url);
      }
    });
  }

  // WhatsApp
  if (shareWaBtn) {
    shareWaBtn.href = `https://wa.me/?text=${encodeURIComponent(title + ' – ' + url)}`;
    shareWaBtn.target = '_blank';
    shareWaBtn.rel = 'noopener noreferrer';
  }

  // Twitter / X
  if (shareTwBtn) {
    shareTwBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    shareTwBtn.target = '_blank';
    shareTwBtn.rel = 'noopener noreferrer';
  }

  // Facebook
  if (shareFbBtn) {
    shareFbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    shareFbBtn.target = '_blank';
    shareFbBtn.rel = 'noopener noreferrer';
  }

  // Email
  if (shareMailBtn) {
    shareMailBtn.href = `mailto:?subject=${encodeURIComponent('Check this out: ' + title)}&body=${encodeURIComponent('I thought you might like this product: ' + url)}`;
  }
}
