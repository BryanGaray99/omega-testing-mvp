import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  Clock,
  Eye,
  Globe,
  MoreVertical,
  XCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import { Endpoint } from "../types/endpoint.types";
import { getMethodColor } from "@/lib/colors";
import { useTranslation } from "@/contexts/LanguageContext";

interface EndpointCardProps {
  endpoint: Endpoint;
  onViewDetails: (endpoint: Endpoint) => void;
  onGenerateTests: (endpoint: Endpoint) => void;
  onReanalyze: (endpoint: Endpoint) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

export default function EndpointCard({
  endpoint,
  onViewDetails,
  onGenerateTests,
  onReanalyze,
  openDropdownId,
  setOpenDropdownId,
}: EndpointCardProps) {
  const { t } = useTranslation();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-[#34D399]" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-[#F87171]" />;
      case "analyzing":
      case "generating":
      case "pending":
        return <Clock className="h-4 w-4 text-[#FBBF24]" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "failed":
        return "destructive";
      case "analyzing":
      case "generating":
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ready":
        return t("endpoints.statusReady");
      case "failed":
        return t("endpoints.statusFailed");
      case "analyzing":
        return t("endpoints.statusAnalyzing");
      case "generating":
        return t("endpoints.statusGenerating");
      case "pending":
        return t("endpoints.statusPending");
      default:
        return status;
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(endpoint.status)}
            <Badge variant={getStatusColor(endpoint.status) as any}>
              {getStatusLabel(endpoint.status)}
            </Badge>
          </div>
          <DropdownMenu 
            open={openDropdownId === endpoint.endpointId}
            onOpenChange={(open) => setOpenDropdownId(open ? endpoint.endpointId : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("endpoints.actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(endpoint)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("endpoints.viewEdit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateTests(endpoint)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("endpoints.generateTests")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReanalyze(endpoint)}>
                <Zap className="mr-2 h-4 w-4" />
                {t("endpoints.reanalyze")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{endpoint.name}</CardTitle>
        <div className="flex items-center text-sm mb-2">
          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
          <code className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs">
            {endpoint.path}
          </code>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {endpoint.methods.map((method, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(method.method)}`}
              >
                {method.method}
              </span>
            ))}
          </div>
          {endpoint.projectName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("endpoints.projectLabel")}</span>
              <span className="font-medium">{endpoint.projectName}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("endpoints.sectionLabel")}</span>
            <span className="font-medium">{endpoint.section}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("endpoints.entityLabel")}</span>
            <span className="font-medium">{endpoint.entityName}</span>
          </div>
          <div className="pt-3 border-t">
            <Button 
              className="w-full" 
              variant="success" 
              size="sm"
              onClick={() => onViewDetails(endpoint)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("endpoints.viewDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 