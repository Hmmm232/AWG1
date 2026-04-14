import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Explore.module.css';

export default function About({ buildTime }) {
  return (
    <>
      <Head>
        <title>About — A Walled Garden</title>
        <meta name="description" content="A Walled Garden is a place to curate and share your favourite books, poems, essays and quotes. Learn how it works and why we built it." />
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader} style={{ textAlign: 'center' }}>
          <h1 className={styles.pageTitle} style={{ display: 'inline-block', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--color-accent)' }}>About A Walled Garden</h1>
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: 'var(--font-serif)', fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--color-ink)' }}>
          <p>I intended this website first as a place where I could talk about my favourite books and poems, reading lists of favourite works, share interesting articles, quotes and curios with little bits of commentary.</p>

          <p style={{ marginTop: '1.25rem' }}>I have extended things so that anyone can create a garden of their own, centered around whatever they please. I think it&rsquo;s pretty intuitive to do so. You can read more about the ins and outs of doing so below.</p>

          <p style={{ marginTop: '1.25rem' }}>I do not intend for this site, like many other places on the internet, to commoditise your time and attention, we do not want to immerse you in the deliberately upsetting and controversial, the emotionally but not intellectually provocative. We want this to be a jumping off point to better things, a mode for sharing and discovering.</p>

          <p style={{ marginTop: '1.25rem' }}>The experience of using much of the internet has become actively harmful. There are treasures on an unimaginable scale out there, immediately available to us, but our attention, on the sites we spend the most time on, is actively channeled into slop &mdash; both human and AI generated.</p>

          <p style={{ marginTop: '1.25rem' }}>I hate &ldquo;content&rdquo;: the business of putting into the collective feeding trough what is most engaging and the constant need to produce and serve up more of it. Each and every one of us, by not being careful with where we are spending our time and our attention is complicit in this, and I do not see how any of these problems will not continue to get worse. We need new structures.</p>

          <p style={{ marginTop: '1.25rem' }}>This site is a walled garden, protected from the weeds, pests and predators out there. If successful it will direct you outwards and onwards, to curiosities and works of art that add to life. We will not keep you captive in an endless stream of ephemeral slop that detracts from it.</p>

          <h2 id="tips" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>A few tips about creating your garden</h2>

          <p>The selections you make will not be carved on your gravestone, you are free to make as many changes, edits, additions and removals as you please, so creating a garden is most enjoyable when you shoot from the hip.</p>

          <p style={{ marginTop: '1.25rem' }}>The value of your garden to someone earnestly looking for something good to read declines in perfect correlation with how cool/pretentious/popular you try to make it. This is not a coolest person in the world competition; why not be sincere?</p>

          <p style={{ marginTop: '1.25rem' }}>Of course if your sincere self is pretentious then be pretentious.</p>

          <p style={{ marginTop: '1.25rem' }}>Size doesn&rsquo;t matter. We encourage you to include short works and links to online writing you like. As a user of this site I like when I can find a good short read for a forty minute train ride as much as a novel which will absorb me for a week on holiday.</p>

          <p style={{ marginTop: '1.25rem' }}>You don&rsquo;t have to create your garden in the order you want it to appear in, you can move your categories, works and quotes around as you please.</p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>The mechanics</h2>

          <p>Anyone can create a garden. You just need to sign up first. Each garden has four tabs: Works &mdash; where you can create categories/reading lists of your favourite works, or your most hated works, or your most whatever works, of art. Quotes: share your favourite quotes, or quotes from works you are reading that you find particularly striking. Re-rec: Share works, categories and quotes from other peoples gardens.</p>

          <p style={{ marginTop: '1.25rem' }}>When you are signed in and view your page you will see the &ldquo;add a category&rdquo; button, use this to create a category &mdash; you can give the category an optional introduction if you want. The add category button will always be at the top of the Garden tab/section. Once you have created a category you add works by clicking the &ldquo;add work.&rdquo; You add a title, using the format &ldquo;title &mdash; author&rdquo; (you can add a year if you like) and then add your commentary, which is optional.</p>

          <p style={{ marginTop: '1.25rem' }}>Once you have added categories and works, you can move them around with the little up and down arrows which appear to the right of the title. There are also share, edit and delete buttons.</p>

          <p style={{ marginTop: '1.25rem' }}>Quotes work much in the same way.</p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: '2.5rem' }}>
            <Link href="/signup" className="btn btn-primary">Create a Garden</Link>
            <Link href="/explore" className="btn btn-secondary">Explore</Link>
          </div>
        </div>

        {buildTime && (
          <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.7rem', color: 'var(--color-ink-faint)', letterSpacing: '0.02em' }}>
            Build {buildTime}
          </p>
        )}
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.65rem', color: '#ccc', letterSpacing: '0.02em' }}>
          Last updated 2026-04-13 10:30 by C
        </p>
      </div>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      buildTime: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    },
  };
}
