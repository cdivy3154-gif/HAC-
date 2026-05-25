import styles from "./HacAvatar.module.css";

/**
 * HacAvatar — Reusable mascot component for HAC 🐴
 * Renders the horse mascot with animated neon green glasses glow.
 *
 * @param {Object} props
 * @param {number} props.size — width and height of the avatar (default 120)
 * @param {boolean} props.pulse — whether to trigger active pulsing animation (default true)
 */
export default function HacAvatar({ size = 120, pulse = true }) {
  return (
    <div 
      className={styles.avatarContainer} 
      style={{ width: size, height: size }}
    >
      <div className={styles.logoWrapper}>
        <img
          src="/hac-logo.png"
          alt="HAC Mascot Avatar"
          className={styles.logoImage}
          width={size}
          height={size}
        />
        {/* Glow overlay mapped to the glasses position */}
        <div 
          className={`${styles.glassesGlow} ${pulse ? styles.pulseGlow : ""}`} 
          aria-hidden="true" 
        />
      </div>
    </div>
  );
}
