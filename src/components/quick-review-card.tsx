import { ArrowRight, Scroll } from "lucide-react";
import { Button } from "./ui/button";

interface QuickReviewCardProps {
  itemsToReview: number;
  onStartReview?: () => void;
}

export function QuickReviewCard({ itemsToReview, onStartReview }: QuickReviewCardProps) {
  if (itemsToReview === 0) return null;

  return (
    <div className="card-paper p-4 md:p-5 border-2 border-foreground/20 relative overflow-hidden">
      {/* Brush stroke accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent" />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-11 h-11 rounded-sm bg-foreground/5 flex items-center justify-center border-2 border-foreground/20">
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
          className="rounded-sm border-2 border-foreground/20 hover:bg-foreground/5 hover:border-foreground/40 font-brush"
        >
          Begin
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
