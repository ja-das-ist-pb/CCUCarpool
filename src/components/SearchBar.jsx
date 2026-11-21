import { PLACES } from "../constants/places";

export default function SearchBar({ filters, onChange, onClear }) {
  const set = (name) => (e) =>
    onChange({ ...filters, [name]: e.target.value });

  const hasFilter = filters.origin || filters.destination || filters.time;

  return (
    <div className="search-panel">
      <input
        className="search-input"
        placeholder="出發地"
        list="places"
        value={filters.origin}
        onChange={set("origin")}
      />
      <input
        className="search-input"
        placeholder="目的地"
        list="places"
        value={filters.destination}
        onChange={set("destination")}
      />
      <label className="search-time" title="只顯示這個時間之後出發的共乘">
        <span>之後出發</span>
        <input
          className="search-input"
          type="datetime-local"
          value={filters.time}
          onChange={set("time")}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker();
            } catch {
              // 瀏覽器不支援就維持預設行為
            }
          }}
        />
      </label>
      {hasFilter && (
        <button type="button" className="search-clear" onClick={onClear}>
          清除
        </button>
      )}

      <datalist id="places">
        {PLACES.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  );
}