// Color scheme for consistent priority and severity styling across the application

export const priorityColors = {
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    chart: '#22C55E', // green-500
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    chart: '#EAB308', // yellow-500
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    chart: '#F97316', // orange-500
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    chart: '#EF4444', // red-500
  },
} as const;

export const severityColors = {
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    chart: '#22C55E', // green-500
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    chart: '#EAB308', // yellow-500
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    chart: '#F97316', // orange-500
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    chart: '#EF4444', // red-500
  },
} as const;

export const statusColors = {
  open: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    chart: '#3B82F6', // blue-500
    icon: '🔵',
  },
  in_progress: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    chart: '#EAB308', // yellow-500
    icon: '🟡',
  },
  resolved: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    chart: '#22C55E', // green-500
    icon: '🟢',
  },
  closed: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    chart: '#6B7280', // gray-500
    icon: '⚫',
  },
} as const;

export const typeColors = {
  test_failure: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    chart: '#EF4444', // red-500
  },
  api_error: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    chart: '#F97316', // orange-500
  },
  ui_bug: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    chart: '#A855F7', // purple-500
  },
  performance: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    chart: '#6366F1', // indigo-500
  },
  security: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    chart: '#EF4444', // red-500
  },
} as const;

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
