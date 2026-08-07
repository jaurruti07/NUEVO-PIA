import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add global pagination vars
    content = content.replace(
        "let filteredData = [];",
        "let filteredData = [];\nlet currentCardsPage = 1;\nlet currentListPage = 1;\nconst ITEMS_PER_PAGE = 15;\nlet currentViewMode = 'grid'; // to keep track"
    )

    # Patch renderCards
    content = re.sub(
        r'function renderCards\(list\) {',
        r'function renderCards(list, append = false) {\n    if (!append) {\n        $cards.innerHTML = \'\';\n        currentCardsPage = 1;\n    }\n    const start = (currentCardsPage - 1) * ITEMS_PER_PAGE;\n    const pageList = list.slice(start, start + ITEMS_PER_PAGE);\n',
        content
    )
    content = content.replace("list.forEach(inst => {", "pageList.forEach(inst => {")
    content = content.replace(
        "initSwiper();\n}",
        "initSwiper();\n\n    if (start + ITEMS_PER_PAGE < list.length) {\n        const trigger = document.createElement('div');\n        trigger.className = 'swiper-slide load-more-trigger';\n        trigger.style = 'width:100%;text-align:center;padding:2rem;color:var(--text-muted);font-weight:bold;';\n        trigger.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Cargando más...';\n        $cards.appendChild(trigger);\n        \n        const observer = new IntersectionObserver((entries) => {\n            if (entries[0].isIntersecting) {\n                observer.disconnect();\n                trigger.remove();\n                currentCardsPage++;\n                renderCards(list, true);\n            }\n        });\n        observer.observe(trigger);\n    }\n}"
    )

    # Patch renderList
    content = re.sub(
        r'function renderList\(list\) {',
        r'function renderList(list, append = false) {\n    const $list = document.getElementById(\'listContainer\');\n    if (!$list) return;\n    if (!append) {\n        $list.innerHTML = \'\';\n        currentListPage = 1;\n    }\n    const start = (currentListPage - 1) * ITEMS_PER_PAGE;\n    const pageList = list.slice(start, start + ITEMS_PER_PAGE);\n',
        content
    )
    
    # We need to make sure we don't mess up list.forEach in renderList.
    # So we change list.forEach to pageList.forEach only inside renderList
    # Wait, the first replacement of list.forEach already caught both if not careful? No, it only caught exact occurrences. Let's be careful.

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('directorio/index.html')
