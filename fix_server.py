with open('server.js', 'r') as f:
    lines = f.readlines()

out = []
in_bad_block = False
skip_next = 0
for i, line in enumerate(lines):
    if i >= 363 and i <= 409:
        continue # skip the second block
    out.append(line)

with open('server.js', 'w') as f:
    f.writelines(out)
