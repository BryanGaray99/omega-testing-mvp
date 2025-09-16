import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BugStatistics as BugStatisticsType } from "@/components/types/bug.types";
import { Bug, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { getStatusColor } from "@/lib/colors";

interface BugStatisticsProps {
  statistics: BugStatisticsType;
}

export function BugStatistics({ statistics }: BugStatisticsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  const getStatusTextColor = (status: string) => {
    const colors = getStatusColor(status as any);
    return colors.text;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Bugs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bugs</CardTitle>
          <Bug className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.total}</div>
        </CardContent>
      </Card>

      {/* Open Bugs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${getStatusTextColor('open')}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusTextColor('open')}`}>{statistics.open}</div>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className={`h-4 w-4 ${getStatusTextColor('in_progress')}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusTextColor('in_progress')}`}>{statistics.inProgress}</div>
        </CardContent>
      </Card>

      {/* Resolved */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle className={`h-4 w-4 ${getStatusTextColor('resolved')}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusTextColor('resolved')}`}>{statistics.resolved}</div>
        </CardContent>
      </Card>
    </div>
  );
}
