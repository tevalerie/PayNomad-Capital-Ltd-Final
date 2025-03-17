import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    date: string;
    content: string;
    imageUrl: string;
  };
}

const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  article,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-[#2c3e50] mb-2">
                {article.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {article.date}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {article.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="text-gray-700 leading-relaxed space-y-4">
          {article.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleModal;
