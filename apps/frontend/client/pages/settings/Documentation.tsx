import { useRef } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  TestTube,
  Layers,
  Bug,
  PlayCircle,
  Bot,
  Palette,
  Trash2,
  ChevronRight,
  ArrowUp,
  List,
} from "lucide-react";

const sections: { id: string; titleKey: TranslationKey; icon: typeof BookOpen }[] = [
  { id: "overview", titleKey: "docs.sectionOverview", icon: BookOpen },
  { id: "dashboard", titleKey: "docs.sectionDashboard", icon: LayoutDashboard },
  { id: "projects", titleKey: "docs.sectionProjects", icon: FolderKanban },
  { id: "endpoints", titleKey: "docs.sectionEndpoints", icon: BarChart3 },
  { id: "test-cases", titleKey: "docs.sectionTestCases", icon: TestTube },
  { id: "test-suites", titleKey: "docs.sectionTestSuites", icon: Layers },
  { id: "bugs", titleKey: "docs.sectionBugs", icon: Bug },
  { id: "test-executions", titleKey: "docs.sectionTestExecutions", icon: PlayCircle },
  { id: "ai-assistant", titleKey: "docs.sectionAIAssistant", icon: Bot },
  { id: "settings-openai", titleKey: "docs.sectionSettingsOpenAI", icon: Bot },
  { id: "settings-appearance", titleKey: "docs.sectionSettingsAppearance", icon: Palette },
  { id: "settings-danger", titleKey: "docs.sectionSettingsDanger", icon: Trash2 },
  { id: "flows", titleKey: "docs.sectionUserFlows", icon: ChevronRight },
];

export default function Documentation() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = id === "top" ? topRef.current : document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6 relative">
      <div ref={topRef} />
      {/* Page title - clearly distinct from layout header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 tracking-tight">
          <BookOpen className="h-8 w-8 text-primary" />
          {t("docs.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("docs.subtitle")}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Table of contents - sticky sidebar with max height and scroll */}
        <div className="hidden xl:block w-56 shrink-0">
          <Card
            className="sticky top-24 flex flex-col overflow-hidden max-h-[min(70vh,28rem)]"
          >
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-sm">{t("docs.contents")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5 overflow-y-auto flex-1 min-h-0 py-0">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <s.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t(s.titleKey)}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div ref={containerRef} className="flex-1 min-w-0 space-y-8">
          {/* Clickable index at the beginning */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <List className="h-4 w-4" />
                {t("docs.index")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => scrollToSection(s.id)}
                  >
                    {t(s.titleKey)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t("docs.sectionOverview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{t("docs.overviewP1")}</p>
                <p>{t("docs.overviewP2")}</p>
              </CardContent>
            </Card>
          </section>

          {/* Dashboard */}
          <section id="dashboard" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  {t("docs.sectionDashboard")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.dashboardDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.actions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.dashboardAction1")}</li>
                  <li>{t("docs.dashboardAction2")}</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Projects */}
          <section id="projects" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  {t("docs.sectionProjects")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /projects</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.projectsDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.pageActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.projectsPageAction1")}</li>
                  <li>{t("docs.projectsPageAction2")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.filters")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.projectsFilter1")}</li>
                  <li>{t("docs.projectsFilter2")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.perCardActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.projectsCard1")}</li>
                  <li>{t("docs.projectsCard2")}</li>
                  <li>{t("docs.projectsCard3")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.openProject")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.openProjectLi")}</li>
                </ul>

                <h4 className="font-semibold text-foreground pt-2">{t("docs.projectsCreateGuideTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.projectsCreateGuideIntro")}</p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                        <th className="text-left font-semibold p-3 w-24">{t("docs.createTableRequired")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableAllowedValues")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.projectsFieldName")}</td>
                        <td className="p-3">{t("docs.projectsFieldNameDesc")}</td>
                        <td className="p-3">{t("docs.projectsFieldNameRequired")}</td>
                        <td className="p-3">{t("docs.projectsFieldNameAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.projectsFieldDisplayName")}</td>
                        <td className="p-3">{t("docs.projectsFieldDisplayNameDesc")}</td>
                        <td className="p-3">{t("docs.projectsFieldDisplayNameRequired")}</td>
                        <td className="p-3">{t("docs.projectsFieldDisplayNameAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.projectsFieldBaseUrl")}</td>
                        <td className="p-3">{t("docs.projectsFieldBaseUrlDesc")}</td>
                        <td className="p-3">{t("docs.projectsFieldBaseUrlRequired")}</td>
                        <td className="p-3">{t("docs.projectsFieldBaseUrlAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.projectsFieldBasePath")}</td>
                        <td className="p-3">{t("docs.projectsFieldBasePathDesc")}</td>
                        <td className="p-3">{t("docs.projectsFieldBasePathRequired")}</td>
                        <td className="p-3">{t("docs.projectsFieldBasePathAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.projectsFieldType")}</td>
                        <td className="p-3">{t("docs.projectsFieldTypeDesc")}</td>
                        <td className="p-3">{t("docs.projectsFieldTypeRequired")}</td>
                        <td className="p-3">{t("docs.projectsFieldTypeAllowed")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-muted-foreground">{t("docs.projectsEmpty")}</p>
              </CardContent>
            </Card>
          </section>

          {/* Endpoints */}
          <section id="endpoints" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("docs.sectionEndpoints")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /endpoints</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.endpointsDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.pageActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.endpointsPageAction1")}</li>
                  <li>{t("docs.endpointsPageAction2")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.filters")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.endpointsFilter1")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.perCardActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.endpointsCard1")}</li>
                  <li>{t("docs.endpointsCard2")}</li>
                </ul>

                <h4 className="font-semibold text-foreground pt-2">{t("docs.endpointsCreateGuideTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.endpointsCreateGuideIntro")}</p>

                <h5 className="font-medium text-foreground text-sm">{t("docs.endpointsCreateModesTitle")}</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.endpointsCreateModeRegister")}</li>
                  <li>{t("docs.endpointsCreateModeEdit")}</li>
                </ul>

                <h5 className="font-medium text-foreground text-sm">{t("docs.endpointsCreateTabsTitle")}</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.endpointsCreateTabBasic")}</li>
                  <li>{t("docs.endpointsCreateTabMethods")}</li>
                </ul>

                <h5 className="font-medium text-foreground text-sm">{t("docs.endpointsCreateFlowTitle")}</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.endpointsCreateFlowStep1")}</li>
                  <li>{t("docs.endpointsCreateFlowStep2")}</li>
                  <li>{t("docs.endpointsCreateFlowStep3")}</li>
                </ol>

                <h5 className="font-medium text-foreground text-sm">{t("docs.endpointsBasicTableTitle")}</h5>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                        <th className="text-left font-semibold p-3 w-24">{t("docs.createTableRequired")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableAllowedValues")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.endpointsFieldProject")}</td>
                        <td className="p-3">{t("docs.endpointsFieldProjectDesc")}</td>
                        <td className="p-3">{t("docs.endpointsFieldProjectRequired")}</td>
                        <td className="p-3">{t("docs.endpointsFieldProjectAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.endpointsFieldSection")}</td>
                        <td className="p-3">{t("docs.endpointsFieldSectionDesc")}</td>
                        <td className="p-3">{t("docs.endpointsFieldSectionRequired")}</td>
                        <td className="p-3">{t("docs.endpointsFieldSectionAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.endpointsFieldEntity")}</td>
                        <td className="p-3">{t("docs.endpointsFieldEntityDesc")}</td>
                        <td className="p-3">{t("docs.endpointsFieldEntityRequired")}</td>
                        <td className="p-3">{t("docs.endpointsFieldEntityAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.endpointsFieldDisplayName")}</td>
                        <td className="p-3">{t("docs.endpointsFieldDisplayNameDesc")}</td>
                        <td className="p-3">{t("docs.endpointsFieldDisplayNameRequired")}</td>
                        <td className="p-3">{t("docs.endpointsFieldDisplayNameAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.endpointsFieldPath")}</td>
                        <td className="p-3">{t("docs.endpointsFieldPathDesc")}</td>
                        <td className="p-3">{t("docs.endpointsFieldPathRequired")}</td>
                        <td className="p-3">{t("docs.endpointsFieldPathAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.endpointsFieldDescription")}</td>
                        <td className="p-3">{t("docs.endpointsFieldDescriptionDesc")}</td>
                        <td className="p-3">{t("docs.endpointsFieldDescriptionRequired")}</td>
                        <td className="p-3">{t("docs.endpointsFieldDescriptionAllowed")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h5 className="font-medium text-foreground text-sm">{t("docs.endpointsMethodsTitle")}</h5>
                <p className="text-sm text-muted-foreground">{t("docs.endpointsMethodsIntro")}</p>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.endpointsRequestBodyTitle")}</h6>
                <p className="text-sm text-muted-foreground">{t("docs.endpointsRequestBodyIntro")}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{t("docs.endpointsFieldTypesTitle")}</span> {t("docs.endpointsFieldTypesList")}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{t("docs.endpointsValidationsTitle")}</span></p>
                <ul className="list-disc list-inside space-y-0.5 text-sm text-muted-foreground">
                  <li>{t("docs.endpointsValidationsString")}</li>
                  <li>{t("docs.endpointsValidationsNumber")}</li>
                  <li>{t("docs.endpointsValidationsBoolean")}</li>
                </ul>

                <p className="text-sm text-muted-foreground">{t("docs.endpointsEmpty")}</p>
              </CardContent>
            </Card>
          </section>

          {/* Test Cases */}
          <section id="test-cases" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  {t("docs.sectionTestCases")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /test-cases</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.testCasesDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.pageActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.testCasesPageAction1")}</li>
                  <li>{t("docs.testCasesPageAction2")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.filtersPagination")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.testCasesFilter1")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.perCardActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.testCasesCard1")}</li>
                  <li>{t("docs.testCasesCard2")}</li>
                  <li>{t("docs.testCasesCard3")}</li>
                </ul>
                <p className="text-sm text-muted-foreground">{t("docs.testCasesCard4")}</p>

                <h4 className="font-semibold text-foreground pt-2">{t("docs.testCasesCreateGuideTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.testCasesCreateGuideIntro")}</p>

                <h5 className="font-medium text-foreground text-sm">{t("docs.testCasesCreateTabsTitle")}</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.testCasesTabPredefined")}</li>
                  <li>{t("docs.testCasesTabAi")}</li>
                  <li>{t("docs.testCasesTabSuggested")}</li>
                </ul>
                <p className="text-sm text-muted-foreground">{t("docs.testCasesAssistantNote")}</p>

                <h5 className="font-medium text-foreground text-sm">{t("docs.testCasesNormalTitle")}</h5>
                <p className="text-sm text-muted-foreground">{t("docs.testCasesNormalFlow")}</p>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.testCasesBasicTableTitle")}</h6>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                        <th className="text-left font-semibold p-3 w-24">{t("docs.createTableRequired")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableAllowedValues")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldProject")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldSection")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldEntity")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldMethod")}</td>
                        <td className="p-3">{t("docs.testCasesFieldMethodDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldMethodRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldMethodAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldTestType")}</td>
                        <td className="p-3">{t("docs.testCasesFieldTestTypeDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldTestTypeRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldTestTypeAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldDescription")}</td>
                        <td className="p-3">{t("docs.testCasesFieldDescriptionDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldDescriptionRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldDescriptionAllowed")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.testCasesScenarioTitle")}</h6>
                <p className="text-sm text-muted-foreground">{t("docs.testCasesScenarioDesc")}</p>

                <h5 className="font-medium text-foreground text-sm mt-3">{t("docs.testCasesAiTitle")}</h5>
                <p className="text-sm text-muted-foreground">{t("docs.testCasesAiIntro")}</p>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.testCasesAiFieldsTableTitle")}</h6>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                        <th className="text-left font-semibold p-3 w-24">{t("docs.createTableRequired")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableAllowedValues")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldProject")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldSection")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldEntity")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesAiFieldRequirements")}</td>
                        <td className="p-3">{t("docs.testCasesAiFieldRequirementsDesc")}</td>
                        <td className="p-3">{t("docs.testCasesAiFieldRequirementsRequired")}</td>
                        <td className="p-3">{t("docs.testCasesAiFieldRequirementsAllowed")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t("docs.testCasesAiOutputNote")}</p>

                <h5 className="font-medium text-foreground text-sm mt-3">{t("docs.testCasesSuggestionsTitle")}</h5>
                <p className="text-sm text-muted-foreground">{t("docs.testCasesSuggestionsIntro")}</p>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.testCasesSuggestionsFieldsTableTitle")}</h6>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                        <th className="text-left font-semibold p-3 w-24">{t("docs.createTableRequired")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableAllowedValues")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldProject")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldProjectAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldSection")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldSectionAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesFieldEntity")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityDesc")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityRequired")}</td>
                        <td className="p-3">{t("docs.testCasesFieldEntityAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.testCasesAiFieldRequirements")}</td>
                        <td className="p-3">{t("docs.testCasesAiFieldRequirementsDesc")}</td>
                        <td className="p-3">{t("docs.testCasesAiFieldRequirementsRequired")}</td>
                        <td className="p-3">{t("docs.testCasesAiFieldRequirementsAllowed")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t("docs.testCasesSuggestionsOutputNote")}</p>
              </CardContent>
            </Card>
          </section>

          {/* Test Suites */}
          <section id="test-suites" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {t("docs.sectionTestSuites")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /test-suites</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.suitesDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.pageActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.suitesPageAction1")}</li>
                  <li>{t("docs.suitesPageAction2")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.filtersPagination")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.suitesFilter1")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.perCardActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.suitesCard1")}</li>
                  <li>{t("docs.suitesCard2")}</li>
                  <li>{t("docs.suitesCard3")}</li>
                </ul>

                <h4 className="font-semibold text-foreground pt-2">{t("docs.suitesCreateGuideTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.suitesCreateGuideIntro")}</p>
                <h5 className="font-medium text-foreground text-sm">{t("docs.suitesCreateTabsTitle")}</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.suitesCreateTabBasic")}</li>
                  <li>{t("docs.suitesCreateTabContent")}</li>
                </ul>
                <h5 className="font-medium text-foreground text-sm mt-3">{t("docs.suitesCreateFlowTitle")}</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.suitesCreateFlowStep1")}</li>
                  <li>{t("docs.suitesCreateFlowStep2")}</li>
                  <li>{t("docs.suitesCreateFlowStep3")}</li>
                </ol>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.suitesBasicTableTitle")}</h6>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                        <th className="text-left font-semibold p-3 w-24">{t("docs.createTableRequired")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableAllowedValues")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.suitesFieldProject")}</td>
                        <td className="p-3">{t("docs.suitesFieldProjectDesc")}</td>
                        <td className="p-3">{t("docs.suitesFieldProjectRequired")}</td>
                        <td className="p-3">{t("docs.suitesFieldProjectAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.suitesFieldName")}</td>
                        <td className="p-3">{t("docs.suitesFieldNameDesc")}</td>
                        <td className="p-3">{t("docs.suitesFieldNameRequired")}</td>
                        <td className="p-3">{t("docs.suitesFieldNameAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.suitesFieldType")}</td>
                        <td className="p-3">{t("docs.suitesFieldTypeDesc")}</td>
                        <td className="p-3">{t("docs.suitesFieldTypeRequired")}</td>
                        <td className="p-3">{t("docs.suitesFieldTypeAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.suitesFieldDescription")}</td>
                        <td className="p-3">{t("docs.suitesFieldDescriptionDesc")}</td>
                        <td className="p-3">{t("docs.suitesFieldDescriptionRequired")}</td>
                        <td className="p-3">{t("docs.suitesFieldDescriptionAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.suitesFieldTags")}</td>
                        <td className="p-3">{t("docs.suitesFieldTagsDesc")}</td>
                        <td className="p-3">{t("docs.suitesFieldTagsRequired")}</td>
                        <td className="p-3">{t("docs.suitesFieldTagsAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.suitesFieldSection")}</td>
                        <td className="p-3">{t("docs.suitesFieldSectionDesc")}</td>
                        <td className="p-3">{t("docs.suitesFieldSectionRequired")}</td>
                        <td className="p-3">{t("docs.suitesFieldSectionAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.suitesFieldEntity")}</td>
                        <td className="p-3">{t("docs.suitesFieldEntityDesc")}</td>
                        <td className="p-3">{t("docs.suitesFieldEntityRequired")}</td>
                        <td className="p-3">{t("docs.suitesFieldEntityAllowed")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.suitesContentTitle")}</h6>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.suitesContentTestSet")}</li>
                  <li>{t("docs.suitesContentTestPlan")}</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Bugs */}
          <section id="bugs" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  {t("docs.sectionBugs")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /bugs</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.bugsDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.pageActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.bugsPageAction1")}</li>
                  <li>{t("docs.bugsPageAction2")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.filters")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.bugsFilter1")}</li>
                </ul>
                <h4 className="font-semibold text-foreground">{t("docs.perCardActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.bugsCard1")}</li>
                  <li>{t("docs.bugsCard2")}</li>
                </ul>

                <h4 className="font-semibold text-foreground pt-2">{t("docs.bugsCreateGuideTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.bugsCreateGuideIntro")}</p>
                <h5 className="font-medium text-foreground text-sm">{t("docs.bugsCreateTabsTitle")}</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.bugsCreateTabBasic")}</li>
                  <li>{t("docs.bugsCreateTabErrors")}</li>
                  <li>{t("docs.bugsCreateTabContext")}</li>
                </ul>
                <h5 className="font-medium text-foreground text-sm mt-3">{t("docs.bugsCreateFlowTitle")}</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.bugsCreateFlowStep1")}</li>
                  <li>{t("docs.bugsCreateFlowStep2")}</li>
                  <li>{t("docs.bugsCreateFlowStep3")}</li>
                </ol>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.bugsBasicTableTitle")}</h6>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                        <th className="text-left font-semibold p-3 w-24">{t("docs.createTableRequired")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableAllowedValues")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.bugsFieldTitle")}</td>
                        <td className="p-3">{t("docs.bugsFieldTitleDesc")}</td>
                        <td className="p-3">{t("docs.bugsFieldTitleRequired")}</td>
                        <td className="p-3">{t("docs.bugsFieldTitleAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.bugsFieldDescription")}</td>
                        <td className="p-3">{t("docs.bugsFieldDescriptionDesc")}</td>
                        <td className="p-3">{t("docs.bugsFieldDescriptionRequired")}</td>
                        <td className="p-3">{t("docs.bugsFieldDescriptionAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.bugsFieldEnvironment")}</td>
                        <td className="p-3">{t("docs.bugsFieldEnvironmentDesc")}</td>
                        <td className="p-3">{t("docs.bugsFieldEnvironmentRequired")}</td>
                        <td className="p-3">{t("docs.bugsFieldEnvironmentAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.bugsFieldType")}</td>
                        <td className="p-3">{t("docs.bugsFieldTypeDesc")}</td>
                        <td className="p-3">{t("docs.bugsFieldTypeRequired")}</td>
                        <td className="p-3">{t("docs.bugsFieldTypeAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.bugsFieldSeverity")}</td>
                        <td className="p-3">{t("docs.bugsFieldSeverityDesc")}</td>
                        <td className="p-3">{t("docs.bugsFieldSeverityRequired")}</td>
                        <td className="p-3">{t("docs.bugsFieldSeverityAllowed")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.bugsFieldPriority")}</td>
                        <td className="p-3">{t("docs.bugsFieldPriorityDesc")}</td>
                        <td className="p-3">{t("docs.bugsFieldPriorityRequired")}</td>
                        <td className="p-3">{t("docs.bugsFieldPriorityAllowed")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.bugsErrorsTitle")}</h6>
                <p className="text-sm text-muted-foreground">{t("docs.bugsErrorsDesc")}</p>
                <h6 className="font-medium text-foreground text-xs mt-2">{t("docs.bugsContextTitle")}</h6>
                <p className="text-sm text-muted-foreground">{t("docs.bugsContextDesc")}</p>
              </CardContent>
            </Card>
          </section>

          {/* Test Executions */}
          <section id="test-executions" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  {t("docs.sectionTestExecutions")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /test-executions</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.execDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.pageActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.execPageAction1")}</li>
                </ul>

                <h4 className="font-semibold text-foreground pt-2">{t("docs.execHowCreatedTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.execHowCreatedDesc")}</p>

                <h4 className="font-semibold text-foreground">{t("docs.execFiltersTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.execFiltersIntro")}</p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold p-3 w-32">{t("docs.createTableField")}</th>
                        <th className="text-left font-semibold p-3">{t("docs.createTableDescription")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterSearch")}</td>
                        <td className="p-3">{t("docs.execFilterSearchDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterProject")}</td>
                        <td className="p-3">{t("docs.execFilterProjectDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterSection")}</td>
                        <td className="p-3">{t("docs.execFilterSectionDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterEntity")}</td>
                        <td className="p-3">{t("docs.execFilterEntityDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterTestType")}</td>
                        <td className="p-3">{t("docs.execFilterTestTypeDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterStatus")}</td>
                        <td className="p-3">{t("docs.execFilterStatusDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterDateRange")}</td>
                        <td className="p-3">{t("docs.execFilterDateRangeDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-foreground">{t("docs.execFilterSort")}</td>
                        <td className="p-3">{t("docs.execFilterSortDesc")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-semibold text-foreground">{t("docs.execStatisticsTitle")}</h4>
                <p className="text-sm text-muted-foreground">{t("docs.execStatisticsDesc")}</p>

                <h4 className="font-semibold text-foreground">{t("docs.perCardActions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.execCard1")}</li>
                  <li>{t("docs.execCard2")}</li>
                </ul>
                <h5 className="font-medium text-foreground text-sm">{t("docs.execDetailsTitle")}</h5>
                <p className="text-sm text-muted-foreground">{t("docs.execDetailsDesc")}</p>
                <p className="text-sm text-muted-foreground">{t("docs.execUrlParams")}</p>
              </CardContent>
            </Card>
          </section>

          {/* AI Assistant */}
          <section id="ai-assistant" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {t("docs.sectionAIAssistant")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /ai-assistant</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.aiDesc")}</p>
              </CardContent>
            </Card>
          </section>

          {/* Settings: OpenAI */}
          <section id="settings-openai" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {t("docs.sectionSettingsOpenAI")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /settings/openai</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.openaiDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.actions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.openaiAction1")}</li>
                  <li>{t("docs.openaiAction2")}</li>
                  <li>{t("docs.openaiAction3")}</li>
                  <li>{t("docs.openaiAction4")}</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Settings: Appearance */}
          <section id="settings-appearance" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t("docs.sectionSettingsAppearance")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /settings/appearance</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.appearanceDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.actions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.appearanceAction1")}</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Settings: Danger Zone */}
          <section id="settings-danger" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  {t("docs.sectionSettingsDanger")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("docs.route")} /settings/danger</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("docs.dangerDesc")}</p>
                <h4 className="font-semibold text-foreground">{t("docs.actions")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("docs.dangerAction1")}</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* User Flows */}
          <section id="flows" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5" />
                  {t("docs.sectionUserFlows")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">{t("docs.flowsIntro")}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Badge variant="outline">{t("docs.flowBadge")} 1</Badge>
                      {t("docs.flow1Title")}
                    </h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>{t("docs.flow1Step1")}</li>
                      <li>{t("docs.flow1Step2")}</li>
                      <li>{t("docs.flow1Step3")}</li>
                      <li>{t("docs.flow1Step4")}</li>
                      <li>{t("docs.flow1Step5")}</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Badge variant="outline">{t("docs.flowBadge")} 2</Badge>
                      {t("docs.flow2Title")}
                    </h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>{t("docs.flow2Step1")}</li>
                      <li>{t("docs.flow2Step2")}</li>
                      <li>{t("docs.flow2Step3")}</li>
                      <li>{t("docs.flow2Step4")}</li>
                      <li>{t("docs.flow2Step5")}</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Badge variant="outline">{t("docs.flowBadge")} 3</Badge>
                      {t("docs.flow3Title")}
                    </h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>{t("docs.flow3Step1")}</li>
                      <li>{t("docs.flow3Step2")}</li>
                      <li>{t("docs.flow3Step3")}</li>
                      <li>{t("docs.flow3Step4")}</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Badge variant="outline">{t("docs.flowBadge")} 4</Badge>
                      {t("docs.flow4Title")}
                    </h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>{t("docs.flow4Step1")}</li>
                      <li>{t("docs.flow4Step2")}</li>
                      <li>{t("docs.flow4Step3")}</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Badge variant="outline">{t("docs.flowBadge")} 5</Badge>
                      {t("docs.flow5Title")}
                    </h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>{t("docs.flow5Step1")}</li>
                      <li>{t("docs.flow5Step2")}</li>
                      <li>{t("docs.flow5Step3")}</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Badge variant="outline">{t("docs.flowBadge")} 6</Badge>
                      {t("docs.flow6Title")}
                    </h4>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>{t("docs.flow6Step1")}</li>
                      <li>{t("docs.flow6Step2")}</li>
                      <li>{t("docs.flow6Step3")}</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* FAB: Back to top */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        onClick={scrollToTop}
        title={t("docs.backToTop")}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
