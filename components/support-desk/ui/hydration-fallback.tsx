import layoutStyles from "./layout.module.css";
import loginStyles from "./login-view.module.css";
import primitiveStyles from "./primitives.module.css";

export function HydrationFallback() {
  return (
    <section className={loginStyles.loginShell}>
      <div className={loginStyles.loginCard}>
        <span className={primitiveStyles.eyebrow}>Support Desk</span>
        <h1>Preparando ambiente...</h1>
      </div>
    </section>
  );
}
