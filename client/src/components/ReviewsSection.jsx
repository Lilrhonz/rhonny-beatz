import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { getToken } from '../auth';
import StarRating from './StarRating';

export default function ReviewsSection({ beatId, user, onRequireLogin }) {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');

  function loadReviews() {
    fetch(`${API_URL}/api/reviews/beat/${beatId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(() => {
    loadReviews();
  }, [beatId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      onRequireLogin();
      return;
    }
    if (rating === 0) {
      setSubmitError('Please select a star rating.');
      return;
    }

    setSubmitStatus('loading');
    setSubmitError('');

    try {
      const res = await fetch(`${API_URL}/api/reviews/beat/${beatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit review');
        setSubmitStatus('idle');
        return;
      }
      setSubmitStatus('done');
      setRating(0);
      setComment('');
    } catch {
      setSubmitError("Couldn't reach the server.");
      setSubmitStatus('idle');
    }
  }

  const average = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="reviews-section">
      <div className="reviews-head">
        <h2 className="section-title">Reviews</h2>
        {average && (
          <div className="reviews-average">
            <StarRating value={Math.round(average)} readOnly />
            <span>{average} ({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
          </div>
        )}
      </div>

      {status === 'ready' && reviews.length === 0 && (
        <p className="notice">No reviews yet — be the first to leave one.</p>
      )}

      {status === 'ready' && reviews.length > 0 && (
        <div className="review-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-card-head">
                <StarRating value={r.rating} readOnly />
                <span className="review-author">{r.reviewer_name}</span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="review-form-wrap">
        {submitStatus === 'done' ? (
          <p className="newsletter-done">✓ Thanks — your review is awaiting approval.</p>
        ) : (
          <form className="review-form" onSubmit={handleSubmit}>
            <p className="review-form-label">Leave a review</p>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              rows="3"
              placeholder={user ? 'What did you think of this beat?' : 'Log in to leave a review'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!user}
            />
            {submitError && <p className="form-error">{submitError}</p>}
            <button
              type="submit"
              className="submit-btn review-submit-btn"
              disabled={submitStatus === 'loading'}
            >
              {user ? (submitStatus === 'loading' ? 'Submitting...' : 'Submit review') : 'Log in to review'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}