import { useEffect, useState } from 'react';
import { API_URL, fileUrl, formatPrice } from '../config';
import { useToast } from './Toast';

// Generic, industry-standard usage terms shown per tier name.
// Edit freely to match whatever your brother actually offers.
const TERMS_BY_TIER = {
  'MP3 Lease': ['MP3 file only', 'Up to 2,000 streams', 'Non-exclusive rights', 'Must credit producer'],
  'WAV Lease': ['MP3 + WAV files', 'Up to 10,000 streams', 'Non-exclusive rights', 'Must credit producer'],
  'Trackout': ['MP3 + WAV + track stems', 'Unlimited streams', 'Non-exclusive rights', 'Must credit producer'],
  'Exclusive': ['All files, full stems', 'Unlimited everything', 'Beat removed from sale after purchase', 'No credit required']
};

export default function LicenseModal({ beatSlug, cart, onAdd, onClose }) {
  const [beat, setBeat] = useState(null);
  const [error, setError] = useState(false);
  const [openTier, setOpenTier] = useState(null);
    const showToast = useToast();

function TERMS_BY_TIER_SOURCE(tierName) {
  return TERMS_BY_TIER[tierName] || [];
}


  function copyTerms(tier, beatTitle) {
    const terms = TERMS_BY_TIER_SOURCE(tier.name).join('\n- ');
    const text = `${beatTitle} — ${tier.name} License\n\n- ${terms}`;
    navigator.clipboard.writeText(text)
      .then(() => showToast('License terms copied!'))
      .catch(() => showToast("Couldn't copy."));
  }

  useEffect(() => {
    fetch(`${API_URL}/api/beats/${beatSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        setBeat(data);
        const prices = [...data.prices].sort((a, b) => a.price_cents - b.price_cents);
        if (prices[0]) setOpenTier(prices[0].tier_id);
      })
      .catch(() => setError(true));
  }, [beatSlug]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const prices = beat ? [...beat.prices].sort((a, b) => a.price_cents - b.price_cents) : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {error && <p className="notice">Couldn't load licence options.</p>}
        {!beat && !error && <p className="notice">Loading...</p>}

        {beat && (
          <>
            <div className="modal-head">
              <img src={fileUrl(beat.cover_art_path)} alt="" />
              <div>
                <h2>{beat.title}</h2>
                <p>{beat.bpm ? `${beat.bpm} BPM` : ''} {beat.key_signature ? `· ${beat.key_signature}` : ''}</p>

            
              </div>
            </div>

            

            <div className="tiers">
              {prices.length === 0 && <p className="notice">This beat has no prices yet.</p>}
              {prices.map((tier) => {
                const inCart = cart.some((i) => i.beatId === beat.id && i.tierId === tier.tier_id);
                const isOpen = openTier === tier.tier_id;
                const terms = TERMS_BY_TIER[tier.name] || [];

                return (
                  <div key={tier.tier_id} className={`tier-card ${tier.is_exclusive ? 'tier-exclusive' : ''}`}>
                    <div className="tier-card-head">
                      <div>
                        <h4>
                          {tier.name}
                          {tier.is_exclusive === 1 && <span className="badge">Exclusive</span>}
                        </h4>
                        <p className="tier-format">{tier.description}</p>
                      </div>
                      <button
                        className="add-btn"
                        disabled={inCart}
                        onClick={() =>
                          onAdd({
                            beatId: beat.id,
                            slug: beat.slug,
                            title: beat.title,
                            tierId: tier.tier_id,
                            tierName: tier.name,
                            price_cents: tier.price_cents,
                            currency: tier.currency
                          })
                        }
                        
                      >
                        🛍 {inCart ? 'In cart' : formatPrice(tier.price_cents, tier.currency)}
                      </button>
                                            <button
                        type="button"
                        className="copy-terms-btn"
                        onClick={() => copyTerms(tier, beat.title)}
                        title="Copy license terms"
                      >
                        ⧉
                      </button>
                    </div>

                    {terms.length > 0 && (
                      <>
                        <button
                          className="terms-toggle"
                          onClick={() => setOpenTier(isOpen ? null : tier.tier_id)}
                        >
                          {isOpen ? '▲ Hide usage terms' : '▼ Show usage terms'}
                        </button>
                        {isOpen && (
                          <ul className="terms-list">
                            {terms.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}