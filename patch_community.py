import re

with open('src/components/views/CommunityHubView.tsx', 'r') as f:
    content = f.read()

target = """  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
         

        <div className="bg-white rounded-[28px] p-2 shadow-2xl shadow-emerald-900/10 border border-slate-100 flex items-center gap-2 sm:gap-3">"""

replacement = """  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <div className="px-4 sm:px-5 mt-2 space-y-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-[28px] p-2 shadow-2xl shadow-emerald-900/10 border border-slate-100 flex items-center gap-2 sm:gap-3">"""

content = content.replace(target, replacement)

with open('src/components/views/CommunityHubView.tsx', 'w') as f:
    f.write(content)
