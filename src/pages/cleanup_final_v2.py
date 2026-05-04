import os

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\components\workspace\Tabs\AnalysisTab.tsx"

with open(file_path, 'rb') as f:
    content = f.read()

# Replace common corrupted em-dash/en-dash sequences
# In many encodings, em-dash is \xe2\x80\x94
# Corrupted UTF-8 might show up as other things.

# Let's try to replace common non-ascii characters with a simple hyphen
new_content = bytearray()
for b in content:
    if b < 128:
        new_content.append(b)
    else:
        # Replace non-ascii with a space or hyphen
        # For our specific case, most non-ascii are dashes
        new_content.append(ord('-'))

with open(file_path, 'wb') as f:
    f.write(new_content)

print("File cleaned of non-ASCII characters.")
