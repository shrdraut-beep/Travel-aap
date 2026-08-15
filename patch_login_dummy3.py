import re

with open('src/components/routripo/LoginScreen.tsx', 'r') as f:
    content = f.read()

developer_mode = """        {/* Developer / Testing Mode */}
        <div className="w-full mt-8 pt-6 border-t border-slate-200/80 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Developer / Testing Mode
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              type="button"
              onClick={() => onLogin('user')}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              Test as User
            </button>
            <button
              type="button"
              onClick={() => onLogin('agent')}
              className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              Test as Partner
            </button>
            <button
              type="button"
              onClick={() => onLogin('admin')}
              className="py-2.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              Test as Admin
            </button>
          </div>
        </div>"""

content = re.sub(r'(\s*)\<\/button\>(\s*)\<\/div\>', r'\1</button>\n' + developer_mode + r'\n\2</div>', content)

with open('src/components/routripo/LoginScreen.tsx', 'w') as f:
    f.write(content)
