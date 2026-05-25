import Link from "next/link";
import styles from "./page.module.css";

// Code rain characters — a mix of code-like symbols and keywords
const CODE_CHARS = [
  "hackathon()", "const", "async", "await", "import", "{}", "=>",
  "function", "return", "class", "export", "module", "</>",
  "npm run", "git push", "deploy()", "build()", "01001",
  "HAC", "🐴", "findHackathon()", "match()", "scrape()",
  "leetcode", "devpost", "MLH", "unstop", "API",
  "useState", "useEffect", "fetch()", "Promise", "async/await",
];

// Generate code rain columns with random positions and speeds
function generateCodeRainColumns(count) {
  const columns = [];
  for (let i = 0; i < count; i++) {
    columns.push({
      id: i,
      left: `${(i / count) * 100 + Math.random() * 3}%`,
      duration: `${15 + Math.random() * 25}s`,
      delay: `${-Math.random() * 20}s`,
      chars: Array.from(
        { length: 8 + Math.floor(Math.random() * 12) },
        () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
      ).join(" "),
    });
  }
  return columns;
}

const codeRainCols = generateCodeRainColumns(20);

export default function LandingPage() {
  return (
    <main className={styles.landing}>
      {/* Code Rain Background */}
      <div className={styles.codeRain} aria-hidden="true">
        {codeRainCols.map((col) => (
          <span
            key={col.id}
            className={styles.codeRainCol}
            style={{
              left: col.left,
              animationDuration: col.duration,
              animationDelay: col.delay,
            }}
          >
            {col.chars}
          </span>
        ))}
      </div>

      {/* Hero Content */}
      <section className={styles.hero}>
        {/* HAC Logo */}
        <div className={styles.logoWrapper}>
          <img
            src="/hac-logo.png"
            alt="HAC — AI Hackathon Finder mascot: a tech-savvy horse wearing glasses and a hoodie"
            className={styles.logo}
            width={200}
            height={200}
          />
        </div>

        {/* Title */}
        <h1 className={styles.title}>
          <span className={styles.titleGreen}>HAC</span>{" "}
          <span className={styles.titleMuted}>finds your</span>
          <br />
          <span className={styles.titleMuted}>next hackathon.</span>
        </h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          <span className={styles.subtitlePrompt}>&gt;_ </span>
          Your AI-powered hackathon scout that never sleeps.
          Witty, smart, and knows every competition on the internet.
        </p>

        {/* CTA Buttons */}
        <div className={styles.ctaGroup}>
          <Link href="/login" className={`btn btn-primary ${styles.ctaPrimary}`}>
            Meet HAC 🐴
          </Link>
          <Link href="/hackathons" className={`btn btn-secondary ${styles.ctaSecondary}`}>
            Browse Hackathons
          </Link>
        </div>

        {/* Feature Pills */}
        <div className={styles.featurePills}>
          <span className={styles.pill}>
            <span className={styles.pillIcon}>🔍</span>
            Auto-Discovery
          </span>
          <span className={styles.pill}>
            <span className={styles.pillIcon}>🤖</span>
            AI Matching
          </span>
          <span className={styles.pill}>
            <span className={styles.pillIcon}>🔔</span>
            Smart Alerts
          </span>
          <span className={styles.pill}>
            <span className={styles.pillIcon}>👥</span>
            Team Finder
          </span>
          <span className={styles.pill}>
            <span className={styles.pillIcon}>📅</span>
            Calendar View
          </span>
        </div>
      </section>

      {/* Bottom Tagline */}
      <p className={styles.tagline}>
        built with <span className={styles.taglineGreen}>♥</span> for hackers,
        by a horse that codes
      </p>
    </main>
  );
}
