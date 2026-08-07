import sys
path = r'c:\Users\prith\Downloads\FloriWish 2\FloriWish\components\(admin)\routes\page\homepage\components\dialogs\components\EditLayoutSlide.tsx'
content = open(path).read()

# Fix the button and the inner span
old_btn = '                                       <Button\n                                         variant="outline"\n                                         className="!bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-100 transition-all duration-300 flex items-center justify-center gap-2 h-10 rounded-xl font-medium"'
new_btn = '                                       <Button\n                                         variant="ghost"\n                                         className="w-full !text-rose-500 hover:!bg-rose-50 !justify-start !px-3 h-11 flex items-center gap-3 transition-all duration-300 rounded-xl"'

content = content.replace(old_btn, new_btn)

# Fix the text inside
old_text = '                                         Delete This Tile'
new_text = '                                         <span className="font-semibold text-sm">Delete This Tile</span>'
content = content.replace(old_text, new_text)

open(path, 'w').write(content)
