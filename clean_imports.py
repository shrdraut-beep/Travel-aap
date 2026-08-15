with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

import_pattern = r'import\s*\{[^}]+\}\s*from\s*"lucide-react";'

clean_import = """import {
  Plus,
  Sparkles,
  Calendar,
  ClipboardList,
  Compass,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Check,
  Trash2,
  Edit3,
  X,
  ChevronRight,
  Share2,
  QrCode,
  Clock,
  Tag,
  Search,
  Plane,
  Train,
  Hotel,
  Ticket,
  FileText,
  CheckCircle2,
  Info,
  CalendarDays,
  ListFilter,
  ShieldCheck,
  Wallet,
  TrendingDown
} from "lucide-react";"""

import re
content = re.sub(import_pattern, clean_import, content, flags=re.DOTALL)

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)

print("Imports cleaned up successfully.")
