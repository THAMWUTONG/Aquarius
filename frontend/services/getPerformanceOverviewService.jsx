export async function getPerformanceOverviewData() {
  const response = await fetch('/api/StPerOverview.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to retrieve performance overview data.');
  }

  return data;
}
