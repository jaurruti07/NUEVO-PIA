#!/bin/bash
# Patch directorio/index.html to include lazy loading for cards and list

sed -i 's/function renderCards(list) {/let currentRenderPage = 1;\nconst ITEMS_PER_PAGE = 20;\n\nfunction renderCards(list, append = false) {\n    if (!append) {\n        $cards.innerHTML = "";\n        currentRenderPage = 1;\n    }\n    const start = (currentRenderPage - 1) * ITEMS_PER_PAGE;\n    const end = start + ITEMS_PER_PAGE;\n    const pageList = list.slice(start, end);\n/g' directorio/index.html

# It's a bit complex with sed, let's just use Python script to patch it more robustly.
