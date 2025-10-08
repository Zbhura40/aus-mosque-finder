import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SEOUtils } from "@/lib/seo-utils";
import { supabase } from "@/integrations/supabase/client";

const UserFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const title = SEOUtils.generateFeedbackPageTitle();
    const description = SEOUtils.generateFeedbackPageMetaDescription();
    const url = window.location.href;
    
    SEOUtils.updateDocumentHead(title, description, url);
  }, []);
  
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

    try {
      // Save feedback to Supabase
      const { error } = await supabase
        .from('feedback')
        .insert({
          feedback_text: feedback.trim(),
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for your valuable feedback. We'll review it and get back to you if needed.",
      });

      setFeedback("");

      // Redirect to home after 1 second
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
                Contact Us | Add Your Mosque to Our Directory
              </h1>
              <p className="text-base text-gray-600 mt-2">
                Help us improve your mosque finding experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-serif font-medium text-gray-900">
                Share Your Thoughts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Feedback Message */}
              <div className="bg-teal-50 rounded-lg p-5 border border-teal-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  We value your feedback! Please share your thoughts, suggestions, or report any issues you've encountered while using our platform. If you would like to see more features or would like additional information on mosques, please let us know.
                </p>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <label
                    htmlFor="feedback"
                    className="text-base font-medium text-gray-900 block"
                  >
                    Your Feedback
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please type your feedback here..."
                    className="min-h-40 text-base rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-teal-500 bg-white text-gray-900 resize-none p-4"
                    maxLength={MAX_CHARACTERS}
                  />

                  {/* Character Counter */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Share your thoughts in detail
                    </span>
                    <span
                      className={`font-medium ${
                        remainingCharacters < 100
                          ? remainingCharacters < 0
                            ? 'text-red-600'
                            : 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {remainingCharacters} characters remaining
                    </span>
                  </div>

                  {/* Error message for character limit */}
                  {remainingCharacters < 0 && (
                    <p className="text-red-600 text-sm">
                      Your feedback exceeds the {MAX_CHARACTERS} character limit. Please shorten it.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || remainingCharacters < 0 || !feedback.trim()}
                    className="w-full h-12 text-base font-medium bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 disabled:opacity-50 rounded-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 leading-relaxed">
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