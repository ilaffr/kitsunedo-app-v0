import { ArrowRight, Scroll } from "lucide-react";
import { Button } from "./ui/button";

interface QuickReviewCardProps {
  itemsToReview: number;
  onStartReview?: () => void;
}

export function QuickReviewCard({ itemsToReview, onStartReview }: QuickReviewCardProps) {
  if (itemsToReview === 0) return null;

  return (
    <div className="washi-card p-5 md:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Scroll className="w-5 h-5 text-foreground/70" strokeWidth={1.5} />
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-0.5">Review Scrolls</p>
            <h3 className="serif-jp font-medium text-foreground tracking-wide">{itemsToReview} memories await</h3>
          </div>
        </div>

        <Button
          onClick={onStartReview}
          variant="ghost"
          className="text-[10px] uppercase tracking-[0.25em] hover:bg-foreground/5 rounded-sm"
        >
          Begin
          <ArrowRight className="w-3.5 h-3.5 ml-2" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
