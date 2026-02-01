import { ArrowRight, Zap } from "lucide-react";
import { Button } from "./ui/button";

interface QuickReviewCardProps {
  itemsToReview: number;
  onStartReview?: () => void;
}

export function QuickReviewCard({ itemsToReview, onStartReview }: QuickReviewCardProps) {
  if (itemsToReview === 0) return null;

  return (
    <div className="card-elevated p-5 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Quick Review</h3>
            <p className="text-sm text-muted-foreground">
              {itemsToReview} items ready for review
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onStartReview}
          variant="outline"
          className="rounded-xl border-accent/30 hover:bg-accent/10"
        >
          Start
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
