import re

with open('contact.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We'll replace everything inside <main id="main-content"> ... </main>
# and add new CSS styles in the <style> tag.
