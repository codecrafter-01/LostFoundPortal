function SearchBar() {
  return (
    <div className="search-section">
      <h2>🔍 Search Lost or Found Items</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by item name (Laptop, ID Card, Wallet...)"
        />

        <button>Search</button>
      </div>
    </div>
  );
}

export default SearchBar;