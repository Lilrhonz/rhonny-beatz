import { useToast } from './Toast';

export default function ShareButton({ url, title, className = 'share-btn' }) {
  const showToast = useToast();

  async function handleShare() {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        // user cancelled the share sheet — not an error, do nothing
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast('Link copied!');
    } catch {
      showToast("Couldn't copy the link.");
    }
  }

  return (
    <button type="button" className={className} onClick={handleShare} aria-label="Share">
      ↗
    </button>
  );
}