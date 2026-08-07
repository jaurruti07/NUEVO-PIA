for filepath in ['directorio/index.html', 'gobierno_en_numeros/index.html']:
    with open(filepath, 'r') as f:
        content = f.read()
    if '</body>' not in content:
        content += "</script>\n</body>\n</html>"
    with open(filepath, 'w') as f:
        f.write(content)
