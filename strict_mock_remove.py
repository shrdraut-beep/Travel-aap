import re

with open('src/components/views/AdminDashboardView.tsx', 'r') as f:
    content = f.read()

# I will replace the fetch logic to remove the else block that provides dummy data.
new_fetch = """  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/metrics').catch(() => null);
        if (res && res.ok) {
           const data = await res.json();
           setAppHealth(data.appHealth || 0);
           setSystemHealth(data.systemHealth || 0);
           setSecurityHealth(data.securityHealth || 0);
           setTotalUsers(data.totalUsers || 0);
        }

        const apiRes = await fetch('/api/admin/health').catch(() => null);
        if (apiRes && apiRes.ok) {
           setApiStatuses(await apiRes.json());
        }

        const usersRes = await fetch('/api/admin/users').catch(() => null);
        if (usersRes && usersRes.ok) {
           setUsersList(await usersRes.json());
        }

        const ticketsRes = await fetch('/api/admin/tickets').catch(() => null);
        if (ticketsRes && ticketsRes.ok) {
           setTicketsList(await ticketsRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);"""

old_fetch_start = "  useEffect(() => {"
old_fetch_end = "  }, []);"

start_idx = content.find(old_fetch_start)
end_idx = content.find(old_fetch_end) + len(old_fetch_end)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_fetch + content[end_idx:]
    with open('src/components/views/AdminDashboardView.tsx', 'w') as f:
        f.write(content)
        print("Updated fetch blocks successfully.")
else:
    print("Could not find fetch block.")

