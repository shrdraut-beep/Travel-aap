import sys

with open('src/components/layout/AppShell.tsx', 'r') as f:
    lines = f.readlines()

start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if 'Center / Remaining Space: Continuous Seamless Travel Animation' in line:
        start_index = i
    if start_index != -1 and i > start_index and 'Right Header: Live Radar' in line:
        end_index = i
        break

if start_index != -1 and end_index != -1:
    new_content = """        {/* Center / Remaining Space: Trip Name */}
        <div className="flex-1 overflow-hidden relative h-9 mx-1 flex items-center justify-center">
          {tripName ? (
            <span className="font-black text-slate-900 text-sm md:text-base text-center whitespace-nowrap overflow-hidden text-ellipsis px-1 max-w-full">
              {tripName}
            </span>
          ) : (
            <span className="font-black text-slate-400 text-sm text-center">
              {lang === 'mr' ? 'माझी सहल' : 'My Trip'}
            </span>
          )}
        </div>

"""
    lines[start_index:end_index] = [new_content]
    
    with open('src/components/layout/AppShell.tsx', 'w') as f:
        f.writelines(lines)
    print("Replaced header successfully")
else:
    print("Could not find header markers", start_index, end_index)
