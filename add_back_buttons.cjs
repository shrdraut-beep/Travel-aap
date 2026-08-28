const fs = require('fs');

function addBackButton(file, isAgent = false) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');

    // Make sure we have ArrowLeft imported
    if (!code.includes('ArrowLeft')) {
        code = code.replace(/import \{/g, "import { ArrowLeft, ");
    }

    // Add back button in header for UserBiddingScreen
    if (file.includes('UserBiddingScreen')) {
        const headerMatch = `<div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 p-5">`;
        const replacement = `<div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 p-5 relative">\n        {onBack && (\n          <button onClick={onBack} className="absolute top-5 left-5 p-2 bg-slate-200/50 hover:bg-slate-200 rounded-full text-slate-800 transition-colors z-10">\n            <ArrowLeft className="w-5 h-5" />\n          </button>\n        )}\n        <div className="pt-8">`;
        code = code.replace(headerMatch, replacement);
        // We added `<div className="pt-8">`, need to close it before `</div>` of header
        code = code.replace(/<\/div>\s*\{\/\* Sub Navigation \*\/\}/, '</div></div>\n\n        {/* Sub Navigation */}');
    }

    if (file.includes('AgentBiddingScreen')) {
        // Find if onBack exists
        if (!code.includes('onBack?: () => void;')) {
            code = code.replace(/interface AgentBiddingScreenProps \{/, 'interface AgentBiddingScreenProps {\n  onBack?: () => void;');
            code = code.replace(/export const AgentBiddingScreen: React.FC<AgentBiddingScreenProps> = \(\{/, 'export const AgentBiddingScreen: React.FC<AgentBiddingScreenProps> = ({\n  onBack,');
        }

        const headerMatch = `<div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 p-5">`;
        const replacement = `<div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 p-5 relative">\n        {onBack && (\n          <button onClick={onBack} className="absolute top-5 left-5 p-2 bg-slate-200/50 hover:bg-slate-200 rounded-full text-slate-800 transition-colors z-10">\n            <ArrowLeft className="w-5 h-5" />\n          </button>\n        )}\n        <div className="pt-8">`;
        code = code.replace(headerMatch, replacement);
        code = code.replace(/<\/div>\s*\{\/\* Sub Navigation \*\/\}/, '</div></div>\n\n        {/* Sub Navigation */}');
    }

    fs.writeFileSync(file, code);
}

addBackButton('src/components/routripo/UserBiddingScreen.tsx');
addBackButton('src/components/routripo/AgentBiddingScreen.tsx');
