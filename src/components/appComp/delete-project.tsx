import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import api from "@/lib/axiosInstance";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import TooltipWrapper from "../tooltip-swrpper";

interface DeleteProjectProps {
  id: number;
  type: string;
  onDelete: (id: number) => void;
  disabled: boolean; // Disable the button when needed
}

const DeleteProject = ({
  id,
  onDelete,
  type,
  disabled,
}: DeleteProjectProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const endpoint =
        type === "resource"
          ? "/Resource"
          : type === "supplier"
          ? "/Supplier"
          : type === "client"
          ? "/Client"
          : "/Project";

      const res = await api.patch(endpoint, {
        id: id,
        isActive: false,
      });

      console.log(`${type} deleted successfully`, res);
      onDelete(id);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Error deleting ${type}`, error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <TooltipWrapper content="Delete">
          <Button
            disabled={disabled}
            className="h-8 w-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
            size="icon"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Button>
        </TooltipWrapper>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This will permanently mark the {type} as inactive.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" onClick={handleDelete}>
            Inactive {type}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProject;
