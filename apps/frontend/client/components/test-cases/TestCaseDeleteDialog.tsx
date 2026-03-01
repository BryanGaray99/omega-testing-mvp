import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestCase } from "@/components/types/testCase.types";
import { useTranslation } from "@/contexts/LanguageContext";
import { replaceParams } from "@/lib/translations";

interface TestCaseDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deletingTestCase: TestCase | null;
  deleteConfirmation: string;
  setDeleteConfirmation: (value: string) => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function TestCaseDeleteDialog({
  isOpen,
  onOpenChange,
  deletingTestCase,
  deleteConfirmation,
  setDeleteConfirmation,
  onConfirmDelete,
  onCancel,
  isPending,
}: TestCaseDeleteDialogProps) {
  const { t } = useTranslation();
  const name = deletingTestCase?.name ?? "";
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">{t("testCases.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {replaceParams(t("testCases.deleteDescription"), { name })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="delete-confirmation">
              {replaceParams(t("testCases.deleteTypeToConfirm"), { name })}
            </Label>
            <Input
              id="delete-confirmation"
              name="delete-confirmation"
              placeholder={name}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="border-destructive focus:border-destructive"
            />
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-xs text-destructive">
              {t("testCases.deleteWarning")}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isPending || deleteConfirmation !== deletingTestCase?.name}
          >
            {isPending ? t("testCases.deleting") : t("testCases.deleteTestCase")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 