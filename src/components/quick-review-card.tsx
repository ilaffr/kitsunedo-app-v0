import { ArrowRight, Zap } from "lucide-react";
import { Button } from "./ui/button";

interface QuickReviewCardProps {
  itemsToReview: number;
  onStartReview?: () => void;
}

export function QuickReviewCard({ itemsToReview, onStartReview }: QuickReviewCardProps) {
  if (itemsToReview === 0) return null;

  return (
    <div className="card-atmospheric p-4 md:p-5 bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-base">Spirit Review</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {itemsToReview} memories ready to strengthen
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onStartReview}
          variant="outline"
          className="rounded-xl border-accent/40 hover:bg-accent/15 hover:border-accent/60 text-sm"
        >
          Begin
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
