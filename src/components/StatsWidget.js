import styles from "./StatsWidget.module.css";

/**
 * StatsWidget — Single stat card with VS Code–style left accent
 * @param {{ icon: string, label: string, value: string|number }} props
 */
export default function StatsWidget({ icon, label, value }) {
  return (
    <div className={styles.card}>
      <div className={styles.accentBorder} />
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
}
