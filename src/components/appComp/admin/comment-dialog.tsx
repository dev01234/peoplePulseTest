"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CommentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => Promise<void>;
    title: string;
    description: string;
    actionType: 'reject' | 'accept' | 'review' | 'onboarding' | 'retain';
}

export default function CommentDialog({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    actionType
}: CommentDialogProps) {
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(comment);
            setComment("");
            onClose();
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setComment("");
        onClose();
    };

    const getButtonColor = () => {
        switch (actionType) {
            case 'reject':
                return 'bg-red-600 hover:bg-red-700';
            case 'accept':
                return 'bg-green-600 hover:bg-green-700';
            case 'review':
                return 'bg-blue-600 hover:bg-blue-700';
            default:
                return 'bg-primary hover:bg-primary/90';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                            id="comment"
                            placeholder="Enter your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!comment.trim() || isSubmitting}
                        className={getButtonColor()}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}