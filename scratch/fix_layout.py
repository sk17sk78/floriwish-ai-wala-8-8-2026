import sys
path = r'c:\Users\prith\Downloads\FloriWish 2\FloriWish\components\(admin)\routes\page\homepage\components\dialogs\components\EditLayoutSlide.tsx'
content = open(path).read()
old = '                                    <div className="flex flex-col gap-1.5 w-full mt-2">'
new = '                                     <div className="col-span-2 pt-4 mt-2 border-t border-charcoal-3/10 w-full">'
content = content.replace(old, new)

# Also fix the button variant and style
old_btn = 'variant="outline"'
new_btn = 'variant="ghost"'
# This might be too broad, so let's use context
old_chunk = '''                                     <div className="col-span-2 pt-4 mt-2 border-t border-charcoal-3/10 w-full">
                                       <Button
                                         variant="outline"
                                         className="!bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-100 transition-all duration-300 flex items-center justify-center gap-2 h-10 rounded-xl font-medium"'''

new_chunk = '''                                     <div className="col-span-2 pt-4 mt-2 border-t border-charcoal-3/10 w-full">
                                       <Button
                                         variant="ghost"
                                         className="w-full !text-rose-500 hover:!bg-rose-50 !justify-start !px-3 h-11 flex items-center gap-3 transition-all duration-300 rounded-xl"'''

content = content.replace(old_chunk, new_chunk)

open(path, 'w').write(content)
