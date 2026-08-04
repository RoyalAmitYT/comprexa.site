with open("js/category-landing.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i == 912 and "result.sort" in line:
        new_lines.append("""
  applyFilterAndSort() {
    let result = [...this.allTools];

    // 1. Apply Search Filter
    if (this.currentSearchQuery) {
      const q = this.currentSearchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // 2. Apply Sort
    if (this.currentSortOption === "az") {
""")
        new_lines.append(line)
    else:
        new_lines.append(line)

with open("js/category-landing.js", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
