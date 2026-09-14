export const fetchTransitSchedules = async (source: string, destination: string) => {
  const clientKey = false;
  if (clientKey) {
  } else {
    const response = await fetch("/api/transit-schedules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source, destination }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}: Failed to fetch transit schedules`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      return { choices: [{ message: { content: JSON.stringify(result.data) } }] };
    }
    throw new Error(result.error || "Failed to fetch transit schedules");
  }
};


