import { ArrowRight, Scroll } from "lucide-react";
import { Button } from "./ui/button";

interface QuickReviewCardProps {
  itemsToReview: number;
  onStartReview?: () => void;
}

export function QuickReviewCard({ itemsToReview, onStartReview }: QuickReviewCardProps) {
  if (itemsToReview === 0) return null;

  return (
    <div className="card-paper p-4 md:p-5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent/5 flex items-center justify-center">
            <Scroll className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-brush font-bold text-foreground">Review Scrolls</h3>
            <p className="text-sm text-muted-foreground">
              {itemsToReview} memories await
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onStartReview}
          variant="outline"
          className="rounded-xl font-brush gap-2"
        >
          Begin
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
