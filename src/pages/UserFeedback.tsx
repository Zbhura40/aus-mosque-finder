import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UserFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const MAX_CHARACTERS = 3000;
  const remainingCharacters = MAX_CHARACTERS - feedback.length;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Empty feedback",
        description: "Please enter your feedback before submitting.",
      });
      return;
    }
    
    if (feedback.length > MAX_CHARACTERS) {
      toast({
        variant: "destructive",
        title: "Character limit exceeded",
        description: `Please keep your feedback under ${MAX_CHARACTERS} characters.`,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call - replace with actual implementation later
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for your valuable feedback. We'll review it and get back to you if needed.",
      });
      
      setFeedback("");
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background elegant-texture">
      {/* Header */}
      <div className="bg-islamic-navy text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-islamic-green/20 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-islamic-green" />
            </div>
            <div>
              <h1 className="font-elegant text-4xl lg:text-5xl font-bold leading-tight">
                User Feedback
              </h1>
              <p className="font-body text-lg text-white/90 mt-2">
                Help us improve your mosque finding experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="card-gradient shadow-xl border border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="font-elegant text-2xl font-semibold text-islamic-navy">
                Share Your Thoughts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Feedback Message */}
              <div className="bg-islamic-green/5 rounded-xl p-6 border border-islamic-green/20">
                <p className="font-body text-lg text-foreground leading-relaxed">
                  We value your feedback! Please share your thoughts, suggestions, or report any issues you've encountered while using our platform. If you would like to see more features or would like additional information on mosques, please let us know.
                </p>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label 
                    htmlFor="feedback" 
                    className="font-body text-lg font-medium text-islamic-navy block"
                  >
                    Your Feedback
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please type your feedback here..."
                    className="min-h-48 font-body text-base rounded-xl border-2 border-muted focus:border-islamic-green resize-none"
                    maxLength={MAX_CHARACTERS}
                  />
                  
                  {/* Character Counter */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-body text-muted-foreground">
                      Share your thoughts in detail
                    </span>
                    <span 
                      className={`font-body font-medium ${
                        remainingCharacters < 100 
                          ? remainingCharacters < 0 
                            ? 'text-destructive' 
                            : 'text-amber-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {remainingCharacters} characters remaining
                    </span>
                  </div>
                  
                  {/* Error message for character limit */}
                  {remainingCharacters < 0 && (
                    <p className="text-destructive text-sm font-body">
                      Your feedback exceeds the {MAX_CHARACTERS} character limit. Please shorten it.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || remainingCharacters < 0 || !feedback.trim()}
                    className="w-full h-16 font-body text-lg font-semibold bg-islamic-green hover:bg-islamic-green-dark text-white shadow-lg transition-all duration-300 disabled:opacity-50 rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Additional Info */}
              <div className="bg-muted/30 rounded-xl p-6 border border-muted">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-6 h-6 text-islamic-green mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-body text-base font-semibold text-islamic-navy">
                      Thank you for helping us improve!
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      Your feedback is valuable to us. We read every submission and use your input to enhance our platform. 
                      While we may not be able to respond to every message individually, we appreciate your time and effort in helping us serve the community better.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserFeedback;