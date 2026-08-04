with open("js/category-landing.js", "r") as f:
    content = f.read()

bad = """  }
      result.sort((a, b) => a.title.localeCompare(b.title));"""

good = """  }

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
      result.sort((a, b) => a.title.localeCompare(b.title));"""

content = content.replace(bad, good)

with open("js/category-landing.js", "w") as f:
    f.write(content)
