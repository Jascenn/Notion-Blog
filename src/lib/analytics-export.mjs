function csvCell(value) {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function analyticsToCsv(exportData) {
  const rows = [['dataset', 'metric', 'timestamp', 'label', 'value']];

  for (const [metric, value] of Object.entries(exportData.stats || {})) {
    rows.push(['stats', metric, '', '', value]);
  }

  for (const [metric, points] of Object.entries(exportData.pageviews || {})) {
    if (!Array.isArray(points)) continue;
    for (const point of points) {
      rows.push(['timeseries', metric, point.x ?? '', '', point.y ?? 0]);
    }
  }

  for (const [metric, items] of Object.entries(exportData.metrics || {})) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      rows.push(['dimension', metric, '', item.x ?? '', item.y ?? 0]);
    }
  }

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}
