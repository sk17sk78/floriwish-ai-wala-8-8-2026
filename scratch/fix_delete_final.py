import sys
import re

path = r'c:\Users\prith\Downloads\FloriWish 2\FloriWish\components\(admin)\routes\page\homepage\components\dialogs\components\EditLayoutSlide.tsx'
content = open(path).read()

# Fix the button styling and functionality
pattern = r'variant="outline"\s+className="!bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-100 transition-all duration-300 flex items-center justify-center gap-2 h-10 rounded-xl font-medium"\s+onClick={() => {\s+const newImages = \(\s+layout.layout.category\s+\?.images as QuickLinkDocument\[\]\s+\).filter\(\(_, i\) => i !== index\);\s+setLayout\(\(prev\) =>\s+prev\s+\? \({\s+...prev,\s+isModified: true,\s+layout: {\s+...prev.layout,\s+category: {\s+...\(prev.layout.category \|\| {}\),\s+images: newImages\s+} as any\s+} as any\s+} as any\)\s+: undefined\s+\);\s+}}'

replacement = r'variant="ghost" className="w-full !text-rose-500 hover:!bg-rose-50 !justify-start !px-3 h-11 flex items-center gap-3 transition-all duration-300 rounded-xl" onClick={() => { setLayout((prev) => { if (!prev) return undefined; const currentImages = (prev.layout.category?.images as any[]) || []; const newImages = currentImages.filter((_, i) => i !== index); return ({ ...prev, isModified: true, layout: { ...prev.layout, category: { ...(prev.layout.category || {}), images: newImages } as any } as any } as any); }); }}'

# Instead of regex, let's just find the start and end of the block we want to replace
start_marker = '<Trash2 className="w-4 h-4" />'
# The button starts a few lines before this.

# Let's try a different way: just search and replace the specific lines
content = content.replace('variant="outline"', 'variant="ghost"')
content = content.replace('!bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-100 transition-all duration-300 flex items-center justify-center gap-2 h-10 rounded-xl font-medium', 'w-full !text-rose-500 hover:!bg-rose-50 !justify-start !px-3 h-11 flex items-center gap-3 transition-all duration-300 rounded-xl')
content = content.replace('Delete This Tile', '<span className="font-semibold text-sm">Delete This Tile</span>')

open(path, 'w').write(content)
