import sys
with open('directorio/index.html', 'r') as f:
    content = f.read()

# Make renderList append loading trigger
target = "            </div>\n        `;\n        $list.appendChild(row);\n    });"
replacement = "            </div>\n        `;\n        $list.appendChild(row);\n    });\n\n    if (start + ITEMS_PER_PAGE < list.length) {\n        const trigger = document.createElement('div');\n        trigger.className = 'load-more-trigger';\n        trigger.style = 'width:100%;text-align:center;padding:1rem;color:var(--text-muted);font-weight:bold;';\n        trigger.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Cargando más...';\n        $list.appendChild(trigger);\n        \n        const observer = new IntersectionObserver((entries) => {\n            if (entries[0].isIntersecting) {\n                observer.disconnect();\n                trigger.remove();\n                currentListPage++;\n                renderList(list, true);\n            }\n        });\n        observer.observe(trigger);\n    }"

content = content.replace(target, replacement)

with open('directorio/index.html', 'w') as f:
    f.write(content)
