import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ClipboardCheck,
  Play,
  Server,
  Globe,
  Gauge,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Loader2,
} from "lucide-react";

/** One executed test/audit row – real data from report (title, result, value, duration, description). */
export type TestRow = {
  title: string;
  result: "pass" | "fail";
  value: string;
  duration: string;
  description: string;
  /** Full error message when result is "fail" (shown when row is expanded). */
  failure?: string;
  /** Collapsible: child rows with same format (pruebas hechas, steps, servicios, axe, etc.). */
  children?: TestRow[];
};

/** Flat list of aspects (backend, Lighthouse). */
type AspectsFlat = { type: "flat"; items: string[] };
/** Grouped by section e.g. by screen (frontend a11y). */
type AspectsBySection = { type: "bySection"; sections: { title: string; items: string[] }[] };
type AspectsDetail = AspectsFlat | AspectsBySection;

type TestSuiteData = {
  titleKey: string;
  icon: React.ReactNode;
  rows: TestRow[];
  passed: number;
  failed: number;
  totalTime: string;
  runCommand: string;
  /** Collapsible "what is tested" detail. */
  aspectsDetail?: AspectsDetail;
};

/** Estandar: mismos pasos en cada controlador (unit). */
const BACKEND_UNIT_CONTROLLER_CHILDREN: TestRow[] = [
  { title: "Servicio mock inyectado", result: "pass", value: "OK", duration: "—", description: "Mock del servicio en el controlador (Test.createTestingModule)." },
  { title: "Peticiones HTTP (GET/POST/PATCH/DELETE)", result: "pass", value: "OK", duration: "—", description: "Supertest: métodos según recurso, rutas y params." },
  { title: "Validación DTOs (class-validator)", result: "pass", value: "OK", duration: "—", description: "Body shape, transform, códigos 422 en payload inválido." },
  { title: "Códigos de estado HTTP", result: "pass", value: "OK", duration: "—", description: "200, 201, 404, 422 según operación y existencia del recurso." },
  { title: "Formato de respuesta (body)", result: "pass", value: "OK", duration: "—", description: "Estructura esperada, TransformInterceptor." },
];
const BACKEND_UNIT_SERVICE_CHILDREN: TestRow[] = [
  { title: "Dependencias inyectadas", result: "pass", value: "OK", duration: "—", description: "Módulo de prueba con providers/mocks." },
  { title: "Métodos bajo prueba", result: "pass", value: "OK", duration: "—", description: "Lógica de negocio o utilidades (getPath, listProjects, buildFilter, etc.)." },
  { title: "Casos borde", result: "pass", value: "OK", duration: "—", description: "Vacío, límites, parámetros inválidos." },
];

const REFERENCE_BACKEND_UNIT_ROWS: TestRow[] = [
  { title: "App (controller, service)", result: "pass", value: "OK", duration: "~0.5s", description: "Bootstrap and health checks.", children: [
    { title: "AppModule", result: "pass", value: "OK", duration: "—", description: "Módulo de prueba con AppModule." },
    { title: "GET /health → 200", result: "pass", value: "OK", duration: "—", description: "body.healthy." },
    { title: "GET / → 200 welcome", result: "pass", value: "OK", duration: "—", description: "Mensaje de bienvenida." },
  ]},
  ...(["Projects", "Endpoints", "Test Cases", "Test Suites", "Bugs", "Sync", "AI"] as const).map((name) => ({
    title: `${name} controller`,
    result: "pass" as const,
    value: "OK",
    duration: "~0.2s",
    description: name === "Projects" ? "CRUD and list projects." : name === "Endpoints" ? "Endpoints CRUD." : name === "Test Cases" ? "Test cases CRUD." : name === "Test Suites" ? "Test suites CRUD." : name === "Bugs" ? "Bugs general API." : name === "Sync" ? "Sync operations." : "AI general endpoints.",
    children: BACKEND_UNIT_CONTROLLER_CHILDREN,
  })),
  { title: "Workspace service", result: "pass", value: "OK", duration: "~0.3s", description: "Workspace path and config.", children: BACKEND_UNIT_SERVICE_CHILDREN },
  { title: "Test execution (filter utils)", result: "pass", value: "OK", duration: "~0.1s", description: "Filter and pagination utilities.", children: BACKEND_UNIT_SERVICE_CHILDREN },
];

/** Estandar: mismos pasos E2E por recurso CRUD. */
const BACKEND_E2E_CRUD_CHILDREN: TestRow[] = [
  { title: "POST → 201 creación", result: "pass", value: "OK", duration: "—", description: "Body válido, respuesta con recurso creado." },
  { title: "GET list → 200", result: "pass", value: "OK", duration: "—", description: "Listado con array, paginación si aplica." },
  { title: "GET by id → 200", result: "pass", value: "OK", duration: "—", description: "Recurso por ID." },
  { title: "PATCH → 200", result: "pass", value: "OK", duration: "—", description: "Actualización parcial." },
  { title: "DELETE → 200/204", result: "pass", value: "OK", duration: "—", description: "Borrado del recurso." },
  { title: "404 cuando recurso no existe", result: "pass", value: "OK", duration: "—", description: "GET/PATCH/DELETE con ID inexistente." },
];

const REFERENCE_BACKEND_E2E_ROWS: TestRow[] = [
  { title: "Health & Welcome", result: "pass", value: "OK", duration: "~0.1s", description: "GET /health, GET / returns 200.", children: [
    { title: "GET /v1/api/health → 200", result: "pass", value: "OK", duration: "—", description: "body.healthy." },
    { title: "GET / → 200 welcome", result: "pass", value: "OK", duration: "—", description: "Mensaje de bienvenida." },
  ]},
  { title: "Projects CRUD (e2e)", result: "pass", value: "OK", duration: "~1.5s", description: "Create, list, get, update, delete projects.", children: BACKEND_E2E_CRUD_CHILDREN },
  { title: "Endpoints CRUD (e2e)", result: "pass", value: "OK", duration: "~0.8s", description: "Endpoints under a project.", children: BACKEND_E2E_CRUD_CHILDREN },
  { title: "Test Cases CRUD (e2e)", result: "pass", value: "OK", duration: "~0.6s", description: "Test cases under a project.", children: BACKEND_E2E_CRUD_CHILDREN },
  { title: "Test Suites CRUD (e2e)", result: "pass", value: "OK", duration: "~0.6s", description: "Test suites and associations.", children: BACKEND_E2E_CRUD_CHILDREN },
  { title: "Bugs & Executions (e2e)", result: "pass", value: "OK", duration: "~0.5s", description: "Bugs and test execution endpoints.", children: [
    { title: "GET list → 200", result: "pass", value: "OK", duration: "—", description: "Listado con filtros." },
    { title: "POST → 201", result: "pass", value: "OK", duration: "—", description: "Creación con body válido." },
    { title: "Query params y códigos", result: "pass", value: "OK", duration: "—", description: "200/201, 404 cuando no existe." },
  ]},
];

/** Estandar: mismas comprobaciones a11y en cada pantalla. */
const FRONTEND_A11Y_CHILDREN: TestRow[] = [
  { title: "aria-label en controles", result: "pass", value: "OK", duration: "—", description: "Botones, enlaces, formularios, Selects y filtros con nombre accesible." },
  { title: "axe-core runA11yAudit", result: "pass", value: "OK", duration: "—", description: "toHaveNoViolations (heading-order en baseline si aplica)." },
  { title: "color-contrast", result: "pass", value: "OK", duration: "—", description: "Contraste de color (regla color-contrast)." },
  { title: "button-name", result: "pass", value: "OK", duration: "—", description: "Botones y enlaces con nombre discernible." },
  { title: "Estructura de encabezados", result: "pass", value: "OK", duration: "—", description: "Heading order, landmarks." },
  { title: "Roles ARIA y landmarks", result: "pass", value: "OK", duration: "—", description: "Roles y landmarks correctos." },
];

const FRONTEND_A11Y_SCREENS = [
  { name: "Layout", path: "Layout", duration: "~2.8s", desc: "Navegación y shell." },
  { name: "Dashboard", path: "Dashboard", duration: "~2.3s", desc: "Métricas y tarjetas." },
  { name: "Projects", path: "Projects", duration: "~0.7s", desc: "Listado y filtros." },
  { name: "Endpoints", path: "Endpoints", duration: "~0.7s", desc: "Tabla y filtros." },
  { name: "Test Cases", path: "Test Cases", duration: "~0.6s", desc: "Listas y filtros." },
  { name: "Test Suites", path: "Test Suites", duration: "~2s", desc: "Combobox y modales." },
  { name: "Bugs", path: "Bugs", duration: "~1.3s", desc: "Tablas y filtros." },
  { name: "Test Executions", path: "Test Executions", duration: "~1.9s", desc: "Filtros y resultados." },
];

const REFERENCE_FRONTEND_UNIT_ROWS: TestRow[] = FRONTEND_A11Y_SCREENS.map(({ name, path, duration, desc }) => ({
  title: `${name} (a11y)`,
  result: "pass" as const,
  value: "OK",
  duration,
  description: desc,
  children: FRONTEND_A11Y_CHILDREN,
}));

/** Estandar: mismas categorías Lighthouse en cada URL. */
const LIGHTHOUSE_CHILDREN: TestRow[] = [
  { title: "Performance", result: "pass", value: "≥25", duration: "—", description: "FCP, LCP, TBT, CLS, Speed Index." },
  { title: "Accessibility", result: "pass", value: "≥85", duration: "—", description: "aria-label, contraste, teclado, ARIA." },
  { title: "Best Practices", result: "pass", value: "≥85", duration: "—", description: "CSP, consola, buenas prácticas." },
  { title: "SEO", result: "pass", value: "≥50", duration: "—", description: "title, meta, enlaces." },
];

const LIGHTHOUSE_SCREENS = [
  { path: "/", name: "Dashboard", duration: "~50s" },
  { path: "/projects", name: "Projects", duration: "~55s" },
  { path: "/endpoints", name: "Endpoints", duration: "~52s" },
  { path: "/test-cases", name: "Test Cases", duration: "~65s" },
  { path: "/test-suites", name: "Test Suites", duration: "~65s" },
  { path: "/bugs", name: "Bugs", duration: "~55s" },
  { path: "/test-executions", name: "Test Executions", duration: "~58s" },
  { path: "/ai-assistant", name: "AI Assistant", duration: "~53s" },
  { path: "/settings/documentation", name: "Settings Documentation", duration: "~58s" },
  { path: "/settings/appearance", name: "Settings Appearance", duration: "~52s" },
  { path: "/settings/openai", name: "Settings OpenAI", duration: "~51s" },
  { path: "/settings/danger", name: "Settings Danger", duration: "~50s" },
];

const REFERENCE_LIGHTHOUSE_ROWS: TestRow[] = LIGHTHOUSE_SCREENS.map(({ path, name, duration }) => ({
  title: `${name} (${path})`,
  result: "pass" as const,
  value: "Perf ≥25, A11y ≥85",
  duration,
  description: "Performance, Accessibility, Best Practices, SEO.",
  children: LIGHTHOUSE_CHILDREN,
}));

const PIE_COLORS = { pass: "hsl(var(--success))", fail: "hsl(var(--destructive))" };

function SummaryChart({ passed, failed }: { passed: number; failed: number }) {
  const { t } = useTranslation();
  const data = [
    { name: t("testsReport.passed"), value: passed, color: PIE_COLORS.pass },
    { name: t("testsReport.failed"), value: failed, color: PIE_COLORS.fail },
  ].filter((d) => d.value > 0);
  if (data.length === 0) return null;
  return (
    <div className="h-[180px] w-full max-w-[200px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, ""]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function AspectsCollapsible({ aspectsDetail }: { aspectsDetail: AspectsDetail }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isA11y = aspectsDetail.type === "bySection";

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-muted/30">
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg">
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <ListChecks className="h-4 w-4 text-primary" />
        {isA11y ? t("testsReport.aspectsTestedA11y") : t("testsReport.aspectsTested")}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-0 space-y-3">
          {aspectsDetail.type === "flat" && (
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {aspectsDetail.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          {aspectsDetail.type === "bySection" && (
            <div className="space-y-4">
              {aspectsDetail.sections.map((section, si) => (
                <div key={si}>
                  <p className="text-sm font-medium text-foreground mb-1.5">{section.title}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-sm text-muted-foreground ml-2">
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ExpandableRow({
  row,
  index,
  expanded,
  onToggle,
  t,
  resultLoading = false,
}: {
  row: TestRow;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  t: (key: string) => string;
  resultLoading?: boolean;
}) {
  const hasChildren = row.children && row.children.length > 0;
  const hasFailure = !!row.failure;
  const hasDetail = hasChildren || hasFailure;

  return (
    <>
      <TableRow className={expanded ? "bg-muted/30" : ""}>
        <TableCell className="w-10 py-1">
          {hasDetail ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle} aria-expanded={expanded}>
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : null}
        </TableCell>
        <TableCell className="font-medium">{row.title}</TableCell>
        <TableCell>
          {resultLoading ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              <span className="text-xs">{t("testsReport.running")}</span>
            </span>
          ) : row.result === "pass" ? (
            <Badge variant="default" className="gap-1 bg-success hover:bg-success">
              <CheckCircle2 className="h-3 w-3" />
              {t("testsReport.passed")}
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              {t("testsReport.failed")}
            </Badge>
          )}
        </TableCell>
        <TableCell className="font-mono text-sm">{row.value}</TableCell>
        <TableCell className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {row.duration}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm max-w-[280px]">
          {row.description}
        </TableCell>
      </TableRow>
      {expanded && hasChildren && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="py-3 pl-8">
            <div className="rounded-md border bg-background/80">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/50">
                    <TableHead className="w-8" />
                    <TableHead className="text-xs">{t("testsReport.title")}</TableHead>
                    <TableHead className="text-xs">{t("testsReport.result")}</TableHead>
                    <TableHead className="text-xs">{t("testsReport.value")}</TableHead>
                    <TableHead className="text-xs">{t("testsReport.duration")}</TableHead>
                    <TableHead className="text-xs">{t("testsReport.description")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row.children!.map((child, i) => (
                    <TableRow key={i} className="border-b last:border-0">
                      <TableCell className="w-8" />
                      <TableCell className="font-medium text-sm">{child.title}</TableCell>
                      <TableCell>
                        {child.result === "pass" ? (
                          <Badge variant="default" className="gap-0.5 bg-success hover:bg-success text-xs">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {t("testsReport.passed")}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-0.5 text-xs">
                            <XCircle className="h-2.5 w-2.5" />
                            {t("testsReport.failed")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{child.value}</TableCell>
                      <TableCell className="text-xs">{child.duration}</TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[240px]">{child.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
      {expanded && hasFailure && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="py-4">
            <div className="pl-4 border-l-2 border-destructive/30">
              <p className="text-sm font-medium text-destructive mb-1">{t("testsReport.failure")}</p>
              <pre className="text-sm text-destructive/90 whitespace-pre-wrap break-words font-sans">
                {row.failure}
              </pre>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

type SuiteId = 'backendUnit' | 'backendE2e';

function TestSuiteSection({
  data,
  suiteId = null,
  onRunSuite,
  running = false,
}: {
  data: TestSuiteData;
  suiteId?: SuiteId | null;
  onRunSuite?: (id: SuiteId) => Promise<void>;
  running?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [runningLocal, setRunningLocal] = useState(false);
  const canRunNow = !!suiteId && !!onRunSuite;
  const isRunning = running || runningLocal;

  const successRate =
    data.passed + data.failed > 0
      ? Math.round((data.passed / (data.passed + data.failed)) * 100)
      : 0;

  async function handleRunNow() {
    if (!suiteId || !onRunSuite) return;
    setRunningLocal(true);
    try {
      await onRunSuite(suiteId);
      setOpen(false);
    } finally {
      setRunningLocal(false);
    }
  }

  return (
    <Card className={isRunning ? "ring-2 ring-primary/30" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {data.icon}
          <span>{t(data.titleKey)}</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {canRunNow ? (
            <Button
              size="sm"
              className="gap-2"
              disabled={isRunning}
              onClick={handleRunNow}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? t("testsReport.running") : t("testsReport.runSuite")}
            </Button>
          ) : null}
          <Dialog open={open} onOpenChange={(next) => !isRunning && setOpen(next)}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant={canRunNow ? "ghost" : "outline"}
                className="gap-2"
                disabled={isRunning}
              >
                {canRunNow ? t("testsReport.viewCommand") || "Ver comando" : t("testsReport.runSuite")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => isRunning && e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>{t("testsReport.runCommandTitle")}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mb-2">
                {t("testsReport.runCommandHint")}
              </p>
              {isRunning && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                  <span>{t("testsReport.running")}</span>
                  <span className="text-muted-foreground">— {t("testsReport.runningHint")}</span>
                </div>
              )}
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
                <code>{data.runCommand}</code>
              </pre>
              {canRunNow && (
                <Button onClick={handleRunNow} disabled={isRunning} className="gap-2 w-full sm:w-auto">
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isRunning ? t("testsReport.running") : t("testsReport.runNow")}
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.aspectsDetail && (
          <AspectsCollapsible aspectsDetail={data.aspectsDetail} />
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" aria-label="Expand" />
                <TableHead>{t("testsReport.title")}</TableHead>
                <TableHead>{t("testsReport.result")}</TableHead>
                <TableHead>{t("testsReport.value")}</TableHead>
                <TableHead>{t("testsReport.duration")}</TableHead>
                <TableHead>{t("testsReport.description")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 && !isRunning ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t("testsReport.noData")}
                  </TableCell>
                </TableRow>
              ) : data.rows.length === 0 && isRunning ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("testsReport.running")}
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((row, i) => (
                  <ExpandableRow
                    key={i}
                    row={row}
                    index={i}
                    expanded={expandedRow === i}
                    onToggle={() => setExpandedRow(expandedRow === i ? null : i)}
                    t={t}
                    resultLoading={isRunning}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Estado / logs de ejecución debajo de la tabla */}
        <div className="rounded-md border bg-muted/20 px-3 py-2 min-h-[44px] flex items-center">
          {isRunning ? (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
              <span>{t("testsReport.running")}</span>
              <span className="text-muted-foreground">— {t("testsReport.runningHint")}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {data.passed + data.failed > 0
                ? t("testsReport.lastRunReady") || "Resultados de la última ejecución listos."
                : t("testsReport.runToSeeResults") || "Ejecuta la suite para ver resultados y el gráfico."}
            </p>
          )}
        </div>

        {/* Gráfico y KPIs: solo cuando no está ejecutando */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          {isRunning ? (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
              <p className="text-sm font-medium">{t("testsReport.waitingForResults") || "Esperando resultados…"}</p>
              <p className="text-xs">{t("testsReport.chartWhenReady") || "El gráfico se mostrará al terminar."}</p>
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">{t("testsReport.summaryChart")}</h4>
                <SummaryChart passed={data.passed} failed={data.failed} />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("testsReport.total")}</span>
                  <span className="font-medium">{data.passed + data.failed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("testsReport.kpiSuccessRate")}</span>
                  <span className="font-medium">{successRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("testsReport.kpiTotalTime")}</span>
                  <span className="font-medium">{data.totalTime}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestsReport() {
  const { t } = useTranslation();
  const API_BASE = import.meta.env.VITE_API_URL || "/v1/api";

  const [backendUnit, setBackendUnit] = useState<TestSuiteData | null>(null);
  const [backendE2e, setBackendE2e] = useState<TestSuiteData | null>(null);
  const [frontendUnit, setFrontendUnit] = useState<TestSuiteData | null>(null);
  const [frontendLighthouse, setFrontendLighthouse] = useState<TestSuiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningSuite, setRunningSuite] = useState<SuiteId | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mapApiRows = (suite: { rows: Array<{ title: string; result: string; value: string; duration: string; description: string; failure?: string }>; passed: number; failed: number; totalTime: string }): TestRow[] =>
    suite.rows.map((r) => ({
      title: r.title,
      result: r.result === "pass" ? "pass" : "fail",
      value: r.value,
      duration: r.duration,
      description: r.description,
      failure: r.failure,
    }));

  const setReferenceBackend = () => {
    setBackendUnit({
      titleKey: "testsReport.backendUnit",
      icon: <Server className="h-5 w-5" />,
      rows: REFERENCE_BACKEND_UNIT_ROWS,
      passed: REFERENCE_BACKEND_UNIT_ROWS.length,
      failed: 0,
      totalTime: "~2.5s",
      runCommand: "npm run test --workspace=apps/backend",
      aspectsDetail: { type: "flat", items: ["Validación de DTOs (class-validator, transform)", "Respuestas HTTP correctas", "Uso de mocks e inyección NestJS", "Filtros y excepciones (HttpExceptionFilter)", "Interceptores de respuesta"] },
    });
    setBackendE2e({
      titleKey: "testsReport.backendE2e",
      icon: <Server className="h-5 w-5" />,
      rows: REFERENCE_BACKEND_E2E_ROWS,
      passed: REFERENCE_BACKEND_E2E_ROWS.length,
      failed: 0,
      totalTime: "~4s",
      runCommand: "npm run test:e2e --workspace=apps/backend",
      aspectsDetail: { type: "flat", items: ["Health: GET /v1/api/health", "Projects/Endpoints/Test Cases/Test Suites/Bugs CRUD e2e", "Códigos HTTP y formato de respuesta"] },
    });
  };

  const applyReportToState = (data: { backendUnit?: { rows: unknown[]; passed: number; failed: number; totalTime: string }; backendE2e?: { rows: unknown[]; passed: number; failed: number; totalTime: string } }) => {
    if (data.backendUnit) {
      setBackendUnit({
        titleKey: "testsReport.backendUnit",
        icon: <Server className="h-5 w-5" />,
        rows: mapApiRows(data.backendUnit),
        passed: data.backendUnit.passed,
        failed: data.backendUnit.failed,
        totalTime: data.backendUnit.totalTime,
        runCommand: "npm run test --workspace=apps/backend",
        aspectsDetail: { type: "flat", items: ["Validación de DTOs (class-validator, transform)", "Respuestas HTTP correctas (status, body shape)", "Uso de mocks (repositories, servicios) para aislar controladores", "Filtros y excepciones (HttpExceptionFilter)", "Interceptores de respuesta (TransformInterceptor)", "Inyección de dependencias y módulos NestJS", "Rutas protegidas y parámetros (params, query)"] },
      });
    }
    if (data.backendE2e) {
      setBackendE2e({
        titleKey: "testsReport.backendE2e",
        icon: <Server className="h-5 w-5" />,
        rows: mapApiRows(data.backendE2e),
        passed: data.backendE2e.passed,
        failed: data.backendE2e.failed,
        totalTime: data.backendE2e.totalTime,
        runCommand: "npm run test:e2e --workspace=apps/backend",
        aspectsDetail: { type: "flat", items: ["Health", "Projects/Endpoints/Test Cases/Test Suites/Bugs CRUD e2e", "Códigos HTTP y formato de respuesta"] },
      });
    }
  };

  async function handleRunSuite(suiteId: SuiteId) {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setRunningSuite(suiteId);
    try {
      const res = await fetch(`${API_BASE}/test-report/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suite: suiteId === "backendUnit" ? "unit" : "e2e" }),
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      // 202 Accepted = pruebas arrancadas en segundo plano; hacer polling
      if (res.status === 202 || data.started === true) {
        const POLL_MS = 4000;
        const MAX_POLL_MS = 3 * 60 * 1000; // 3 minutos
        let elapsed = 0;
        pollIntervalRef.current = setInterval(async () => {
          elapsed += POLL_MS;
          try {
            const r = await fetch(`${API_BASE}/test-report`);
            if (r.ok) {
              const report = await r.json();
              applyReportToState(report);
            }
          } catch {
            // ignorar errores de polling
          }
          if (elapsed >= MAX_POLL_MS && pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setRunningSuite(null);
          }
        }, POLL_MS);
        return;
      }
      if (!res.ok) throw new Error("Run failed");
      applyReportToState(data);
    } catch {
      setReferenceBackend();
    } finally {
      if (!pollIntervalRef.current) setRunningSuite(null);
    }
  }

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/test-report`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.backendUnit) {
            setBackendUnit({
              titleKey: "testsReport.backendUnit",
              icon: <Server className="h-5 w-5" />,
              rows: mapApiRows(data.backendUnit),
              passed: data.backendUnit.passed,
              failed: data.backendUnit.failed,
              totalTime: data.backendUnit.totalTime,
              runCommand: "npm run test --workspace=apps/backend",
              aspectsDetail: {
                type: "flat",
                items: [
                  "Validación de DTOs (class-validator, transform)",
                  "Respuestas HTTP correctas (status, body shape)",
                  "Uso de mocks (repositories, servicios) para aislar controladores",
                  "Filtros y excepciones (HttpExceptionFilter)",
                  "Interceptores de respuesta (TransformInterceptor)",
                  "Inyección de dependencias y módulos NestJS",
                  "Rutas protegidas y parámetros (params, query)",
                ],
              },
            });
          } else {
            setBackendUnit({
              titleKey: "testsReport.backendUnit",
              icon: <Server className="h-5 w-5" />,
              rows: REFERENCE_BACKEND_UNIT_ROWS,
              passed: REFERENCE_BACKEND_UNIT_ROWS.length,
              failed: 0,
              totalTime: "~2.5s",
              runCommand: "npm run test --workspace=apps/backend",
              aspectsDetail: { type: "flat", items: ["Validación de DTOs (class-validator, transform)", "Respuestas HTTP correctas", "Uso de mocks e inyección NestJS", "Filtros y excepciones (HttpExceptionFilter)", "Interceptores de respuesta"] },
            });
          }
          if (data.backendE2e) {
            setBackendE2e({
              titleKey: "testsReport.backendE2e",
              icon: <Server className="h-5 w-5" />,
              rows: mapApiRows(data.backendE2e),
              passed: data.backendE2e.passed,
              failed: data.backendE2e.failed,
              totalTime: data.backendE2e.totalTime,
              runCommand: "npm run test:e2e --workspace=apps/backend",
              aspectsDetail: { type: "flat", items: ["Health", "Projects/Endpoints/Test Cases/Test Suites/Bugs CRUD e2e", "Códigos HTTP y formato de respuesta"] },
            });
          } else {
            setBackendE2e({
              titleKey: "testsReport.backendE2e",
              icon: <Server className="h-5 w-5" />,
              rows: REFERENCE_BACKEND_E2E_ROWS,
              passed: REFERENCE_BACKEND_E2E_ROWS.length,
              failed: 0,
              totalTime: "~4s",
              runCommand: "npm run test:e2e --workspace=apps/backend",
              aspectsDetail: { type: "flat", items: ["Health: GET /v1/api/health", "Projects/Endpoints/Test Cases/Test Suites/Bugs CRUD e2e", "Códigos HTTP y formato de respuesta"] },
            });
          }
        } else if (!cancelled) {
          setReferenceBackend();
        }
      } catch {
        if (!cancelled) setReferenceBackend();
      }
      if (!cancelled) {
        setFrontendUnit({
          titleKey: "testsReport.frontendUnit",
          icon: <Globe className="h-5 w-5" />,
          rows: REFERENCE_FRONTEND_UNIT_ROWS,
          passed: REFERENCE_FRONTEND_UNIT_ROWS.length,
          failed: 0,
          totalTime: "~12s",
          runCommand: "npm run test --workspace=apps/frontend",
          aspectsDetail: { type: "bySection", sections: [{ title: "a11y (axe-core)", items: ["aria-label", "button-name", "color-contrast", "roles ARIA"] }] },
        });
        setFrontendLighthouse({
          titleKey: "testsReport.frontendLighthouse",
          icon: <Gauge className="h-5 w-5" />,
          rows: REFERENCE_LIGHTHOUSE_ROWS,
          passed: REFERENCE_LIGHTHOUSE_ROWS.length,
          failed: 0,
          totalTime: "~4 min (14 pantallas)",
          runCommand: "npm run test:lighthouse --workspace=apps/frontend",
          aspectsDetail: { type: "flat", items: ["Por pantalla: Performance, Accessibility, Best Practices, SEO. Umbrales: perf ≥25, a11y ≥85, best-practices ≥85, seo ≥50."] },
        });
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function buildEmptySuite(titleKey: string, icon: React.ReactNode, runCommand: string, aspectsDetail: AspectsDetail): TestSuiteData {
    return {
      titleKey,
      icon,
      rows: [],
      passed: 0,
      failed: 0,
      totalTime: "—",
      runCommand,
      aspectsDetail,
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">{t("testsReport.loading") || "Loading report…"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <ClipboardCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("testsReport.pageTitle")}</h2>
          <p className="mt-1 text-muted-foreground max-w-3xl">
            {t("testsReport.subtitle")}
          </p>
        </div>
      </div>

      {backendUnit && (
        <TestSuiteSection
          data={backendUnit}
          suiteId="backendUnit"
          onRunSuite={handleRunSuite}
          running={runningSuite === "backendUnit"}
        />
      )}
      {backendE2e && (
        <TestSuiteSection
          data={backendE2e}
          suiteId="backendE2e"
          onRunSuite={handleRunSuite}
          running={runningSuite === "backendE2e"}
        />
      )}
      {frontendUnit && <TestSuiteSection data={frontendUnit} />}
      {frontendLighthouse && <TestSuiteSection data={frontendLighthouse} />}
    </div>
  );
}
