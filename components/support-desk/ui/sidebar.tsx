import { SIDEBAR_ITEMS, type SidebarItem } from "../support-desk.constants";
import styles from "./sidebar.module.css";

type SidebarProps = {
  isTechnician: boolean;
  searchTerm: string;
  selectedSidebarItem: SidebarItem;
  onSearchTermChange: (value: string) => void;
  onSidebarItemSelect: (item: SidebarItem) => void;
};

export function Sidebar({
  isTechnician,
  searchTerm,
  selectedSidebarItem,
  onSearchTermChange,
  onSidebarItemSelect,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <span className={styles.sidebarEyebrow}>Help Desk</span>
        <strong>Milvus Desk</strong>
        <p>{isTechnician ? "Operação técnica" : "Área do cliente"}</p>
      </div>

      <nav className={styles.sidebarMenu} aria-label="Navegação de tickets">
        <div className={styles.sidebarSearchWrap}>
          <span className={styles.sidebarSearchIcon} aria-hidden="true">
            &#128269;
          </span>
          <input
            className={styles.sidebarSearchInput}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Buscar"
            type="search"
            value={searchTerm}
          />
        </div>

        {SIDEBAR_ITEMS.map((item) => (
          <button
            className={item === selectedSidebarItem ? styles.sidebarMenuButtonActive : styles.sidebarMenuButton}
            key={item}
            onClick={() => onSidebarItemSelect(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
