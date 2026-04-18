import { useEffect } from 'react';

const DEFAULT_TITLE = 'QMail - Reclaim Your Digital Sovereignty';
const DEFAULT_DESC = 'Decentralized, quantum-safe email. No servers, no surveillance, no spam. Own your inbox.';

export function useDocumentMeta({ title, description } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | QMail` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;

    document.title = fullTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDesc) metaDesc.setAttribute('content', DEFAULT_DESC);
      if (ogTitle) ogTitle.setAttribute('content', DEFAULT_TITLE);
      if (ogDesc) ogDesc.setAttribute('content', DEFAULT_DESC);
    };
  }, [title, description]);
}
