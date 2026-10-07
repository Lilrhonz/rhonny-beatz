import { useEffect } from 'react';

const SITE_NAME = 'Rhonny Beatz';
const DEFAULT_DESCRIPTION = 'Stream and license original beats from Rhonny Beatz.';

function setMetaTag(name, content, attr = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function SEO({ title, description, noindex = false }) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Official Beat Store`;

    const desc = description || DEFAULT_DESCRIPTION;
    setMetaTag('description', desc);
    setMetaTag('og:title', document.title, 'property');
    setMetaTag('og:description', desc, 'property');

    let robotsTag = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', 'noindex, nofollow');
    } else if (robotsTag) {
      robotsTag.remove();
    }
  }, [title, description, noindex]);

  return null;
}