// Color scheme for consistent priority and severity styling across the application
// Dark mode: paleta técnica #064E3B/#34D399 success, #3F1D1D/#F87171 error, #3F2A0E/#FBBF24 warning, #1E3A8A/#93C5FD info

export const priorityColors = {
  low: {
    bg: 'bg-green-100 dark:bg-[#064E3B]',
    text: 'text-green-800 dark:text-[#34D399]',
    border: 'border-green-200 dark:border-[#065F46]',
    chart: '#22C55E', // green-500
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-[#3F2A0E]',
    text: 'text-yellow-800 dark:text-[#FBBF24]',
    border: 'border-yellow-200 dark:border-[#92400E]',
    chart: '#EAB308', // yellow-500
  },
  high: {
    bg: 'bg-orange-100 dark:bg-[#3F2A0E]',
    text: 'text-orange-800 dark:text-[#FBBF24]',
    border: 'border-orange-200 dark:border-[#92400E]',
    chart: '#F97316', // orange-500
  },
  critical: {
    bg: 'bg-red-100 dark:bg-[#3F1D1D]',
    text: 'text-red-800 dark:text-[#F87171]',
    border: 'border-red-200 dark:border-[#7F1D1D]',
    chart: '#EF4444', // red-500
  },
} as const;

export const severityColors = {
  low: {
    bg: 'bg-green-100 dark:bg-[#064E3B]',
    text: 'text-green-800 dark:text-[#34D399]',
    border: 'border-green-200 dark:border-[#065F46]',
    chart: '#22C55E', // green-500
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-[#3F2A0E]',
    text: 'text-yellow-800 dark:text-[#FBBF24]',
    border: 'border-yellow-200 dark:border-[#92400E]',
    chart: '#EAB308', // yellow-500
  },
  high: {
    bg: 'bg-orange-100 dark:bg-[#3F2A0E]',
    text: 'text-orange-800 dark:text-[#FBBF24]',
    border: 'border-orange-200 dark:border-[#92400E]',
    chart: '#F97316', // orange-500
  },
  critical: {
    bg: 'bg-red-100 dark:bg-[#3F1D1D]',
    text: 'text-red-800 dark:text-[#F87171]',
    border: 'border-red-200 dark:border-[#7F1D1D]',
    chart: '#EF4444', // red-500
  },
} as const;

export const statusColors = {
  open: {
    bg: 'bg-blue-100 dark:bg-[#1E3A8A]',
    text: 'text-blue-800 dark:text-[#93C5FD]',
    border: 'border-blue-200 dark:border-[#1D4ED8]',
    chart: '#3B82F6', // blue-500
    icon: '🔵',
  },
  in_progress: {
    bg: 'bg-yellow-100 dark:bg-[#3F2A0E]',
    text: 'text-yellow-800 dark:text-[#FBBF24]',
    border: 'border-yellow-200 dark:border-[#92400E]',
    chart: '#EAB308', // yellow-500
    icon: '🟡',
  },
  resolved: {
    bg: 'bg-green-100 dark:bg-[#064E3B]',
    text: 'text-green-800 dark:text-[#34D399]',
    border: 'border-green-200 dark:border-[#065F46]',
    chart: '#22C55E', // green-500
    icon: '🟢',
  },
  closed: {
    bg: 'bg-gray-100 dark:bg-[#1F2937]',
    text: 'text-gray-800 dark:text-[#9CA3AF]',
    border: 'border-gray-200 dark:border-[#334155]',
    chart: '#6B7280', // gray-500
    icon: '⚫',
  },
} as const;

export const typeColors = {
  test_failure: {
    bg: 'bg-red-100 dark:bg-[#3F1D1D]',
    text: 'text-red-800 dark:text-[#F87171]',
    border: 'border-red-200 dark:border-[#7F1D1D]',
    chart: '#EF4444', // red-500
  },
  api_error: {
    bg: 'bg-orange-100 dark:bg-[#3F2A0E]',
    text: 'text-orange-800 dark:text-[#FBBF24]',
    border: 'border-orange-200 dark:border-[#92400E]',
    chart: '#F97316', // orange-500
  },
  ui_bug: {
    bg: 'bg-purple-100 dark:bg-[#1E3A8A]',
    text: 'text-purple-800 dark:text-[#93C5FD]',
    border: 'border-purple-200 dark:border-[#1D4ED8]',
    chart: '#A855F7', // purple-500
  },
  performance: {
    bg: 'bg-indigo-100 dark:bg-[#1E3A8A]',
    text: 'text-indigo-800 dark:text-[#93C5FD]',
    border: 'border-indigo-200 dark:border-[#1D4ED8]',
    chart: '#6366F1', // indigo-500
  },
  security: {
    bg: 'bg-red-100 dark:bg-[#3F1D1D]',
    text: 'text-red-800 dark:text-[#F87171]',
    border: 'border-red-200 dark:border-[#7F1D1D]',
    chart: '#EF4444', // red-500
  },
} as const;

// HTTP method badge colors - paleta técnica sin neón
export const methodColors: Record<string, { bg: string; text: string }> = {
  GET: { bg: "bg-blue-100 dark:bg-[#1E3A8A]", text: "text-blue-800 dark:text-[#93C5FD]" },
  POST: { bg: "bg-green-100 dark:bg-[#064E3B]", text: "text-green-800 dark:text-[#6EE7B7]" },
  PUT: { bg: "bg-orange-100 dark:bg-[#3F2A0E]", text: "text-orange-800 dark:text-[#FBBF24]" },
  PATCH: { bg: "bg-amber-100 dark:bg-[#3F2A0E]", text: "text-amber-800 dark:text-[#FBBF24]" },
  DELETE: { bg: "bg-red-100 dark:bg-[#3F1D1D]", text: "text-red-800 dark:text-[#F87171]" },
};

export const getMethodColor = (method: string) => {
  const colors = methodColors[method] || { bg: "bg-gray-100 dark:bg-[#1F2937]", text: "text-gray-800 dark:text-[#9CA3AF]" };
  return `${colors.bg} ${colors.text}`;
};

// Helper functions
export const getPriorityColor = (priority: keyof typeof priorityColors) => {
  return priorityColors[priority] || priorityColors.medium;
};

export const getSeverityColor = (severity: keyof typeof severityColors) => {
  return severityColors[severity] || severityColors.medium;
};

export const getStatusColor = (status: keyof typeof statusColors) => {
  return statusColors[status] || statusColors.open;
};

export const getTypeColor = (type: keyof typeof typeColors) => {
  return typeColors[type] || typeColors.test_failure;
};

// Chart color arrays for consistent pie charts
export const priorityChartColors = [
  priorityColors.low.chart,
  priorityColors.medium.chart,
  priorityColors.high.chart,
  priorityColors.critical.chart,
];

export const severityChartColors = [
  severityColors.low.chart,
  severityColors.medium.chart,
  severityColors.high.chart,
  severityColors.critical.chart,
];

export const statusChartColors = [
  statusColors.open.chart,
  statusColors.in_progress.chart,
  statusColors.resolved.chart,
  statusColors.closed.chart,
];

export const typeChartColors = [
  typeColors.test_failure.chart,
  typeColors.api_error.chart,
  typeColors.ui_bug.chart,
  typeColors.performance.chart,
  typeColors.security.chart,
];
