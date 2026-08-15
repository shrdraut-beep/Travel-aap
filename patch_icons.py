import re

with open("src/theme/icons.tsx", "r") as f:
    content = f.read()

old_nav = """
export const NAV_USER_ICONS = [
  { key: "hub", label: "Hub", icon: HomeIcon },
  { key: "trips", label: "Trips", icon: TripsIcon },
  { key: "planning", label: "Planning", icon: PlanningIcon },
  { key: "social", label: "Social", icon: SocialIcon },
  { key: "booking", label: "Booking", icon: BookingIcon },
  { key: "expenses", label: "Expenses", icon: ExpensesIcon },
];
"""

new_nav = """
export const NAV_USER_ICONS = [
  { key: "planning", label: "Planning", icon: HomeIcon },
  { key: "trips", label: "Trips", icon: TripsIcon },
  { key: "social", label: "Social", icon: SocialIcon },
  { key: "booking", label: "Booking", icon: BookingIcon },
  { key: "expenses", label: "Expenses", icon: ExpensesIcon },
];
"""

content = content.replace(old_nav.strip(), new_nav.strip())

with open("src/theme/icons.tsx", "w") as f:
    f.write(content)
