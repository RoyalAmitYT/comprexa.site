with open("js/category-landing.js", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == "result.sort((a, b) => a.title.localeCompare(b.title));" and new_lines[-1].strip() == "}":
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

with open("js/category-landing.js", "w") as f:
    f.writelines(new_lines)
