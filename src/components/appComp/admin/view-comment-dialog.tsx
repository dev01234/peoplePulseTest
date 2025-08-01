"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import api from "@/lib/axiosInstance";

interface ViewCommentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    comment: string;
    resourceCode: string;
    resourceId: string; // Added resourceId prop
}

export default function ViewCommentDialog({
    isOpen,
    onClose,
    comment,
    resourceCode,
    resourceId
}: ViewCommentDialogProps) {

    function handleSupplierCommentSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // @ts-ignore
        const supplierComment = e.target.supplierComment.value;
        try {
            api.post(`/Resource/${resourceId}/review/1`, { supcomment: supplierComment })
            onClose()
        } catch (error) {
            console.error("Error submitting supplier comment:", error);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        PM Comment
                    </DialogTitle>
                    <DialogDescription>
                        Comment for resource: {resourceCode}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                        {comment ? (
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {comment}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No comment available for this resource.
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <h1>Supplier Comment</h1>
                    <form
                        onSubmit={handleSupplierCommentSubmit}
                        className="flex flex-col gap-2"
                    >
                        <textarea
                            name="supplierComment"
                            className="border rounded p-2 min-h-[60px] text-sm"
                            placeholder="Enter supplier comment..."
                        />
                        <Button type="submit" className="self-end mt-2">Submit</Button>
                    </form>
                </div>

                <div className="flex justify-end">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}