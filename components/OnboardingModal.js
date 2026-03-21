import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Onboarding.module.css';

const SLIDES = [
  {
    title: 'Welcome to your garden',
    body: 'Your own corner of the internet, a place to gather the books, poems, essays you love and discover works loved by others.',
  },
  {
    title: 'How it works',
    body: 'Your garden is organised into categories — think of them as shelves or collections. Each category holds works, with optional commentary from you on why they matter.',
    list: [
      '"Favourite Novels"',
      '"Essays That Changed How I Think"',
      '"Poetry for Dark Evenings"',
      '"History of Rome"',
      '"Things I Return To"',
    ],
  },
  {
    title: 'Your toolkit',
    body: 'Everything you need to create your garden is on the page.',
    hints: [
      ['+ Add a category', 'Creates a new shelf in your garden'],
      ['+ Add a work', 'Adds a book, essay, poem or curiosity to a category'],
      ['Edit / Delete', 'Appear on your own categories and works'],
      ['\u25B2 \u25BC arrows', 'Drag categories and works into your preferred order'],
      ['Commentary', 'Add optional commentary on the work'],
      ['Share garden', 'Copies a link to the garden to make it easy to share'],
    ],
  },
  {
    title: 'Beyond the garden',
    body: 'Use our explore pages to discover what the community is reading, save works to your reading list, follow gardens you admire and find short works to read on the go.',
  },
  {
    title: 'One last thing',
    body: (<>Read about why we are building <Link href="/about"><em>awalledgarden.org</em></Link> here, or start now by adding your first category.</>),
  },
];

export default function OnboardingModal({ onClose }) {
  const [slide, setSlide] = useState(0);
  const [exiting, setExiting] = useState(false);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  // Close on escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleClose() {
    setExiting(true);
    setTimeout(() => onClose(), 250);
  }

  function handleNext() {
    if (isLast) {
      handleClose();
    } else {
      setSlide(slide + 1);
    }
  }

  function handleBack() {
    if (slide > 0) setSlide(slide - 1);
  }

  return (
    <div
      className={`${styles.backdrop} ${exiting ? styles.backdropExit : ''}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${exiting ? styles.modalExit : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to A Walled Garden"
      >
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className={styles.content}>
          <p className={styles.step}>
            {slide + 1} / {SLIDES.length}
          </p>

          <h2 className={styles.title}>{current.title}</h2>
          <p className={styles.body}>{current.body}</p>

          {current.list && (
            <ul className={styles.examples}>
              {current.list.map((item, i) => (
                <li key={i} className={styles.example}>{item}</li>
              ))}
            </ul>
          )}

          {current.hints && (
            <dl className={styles.hints}>
              {current.hints.map(([term, desc], i) => (
                <div key={i} className={styles.hint}>
                  <dt className={styles.hintTerm}>{term}</dt>
                  <dd className={styles.hintDesc}>{desc}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.dots}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === slide ? styles.dotActive : ''}`}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className={styles.nav}>
            {slide > 0 && (
              <button
                className={`btn btn-secondary btn-small`}
                onClick={handleBack}
              >
                Back
              </button>
            )}
            <button
              className={`btn btn-primary btn-small`}
              onClick={handleNext}
            >
              {isLast ? 'Start planting' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
