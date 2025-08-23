import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  category: z.string().min(1, "Please select a category"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { toast } = useToast();

  const categories = [
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "improvement", label: "Improvement Suggestion" },
    { value: "usability", label: "Usability Issue" },
    { value: "performance", label: "Performance Issue" },
    { value: "general", label: "General Feedback" }
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("feedback").insert({
        user_id: userData.user?.id || null,
        name: data.name || null,
        email: data.email,
        category: data.category,
        subject: data.subject,
        message: data.message,
        rating: data.rating,
      });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We appreciate your input.",
      });

      reset();
      setRating(0);
      setSelectedCategory("");
      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    setValue("rating", selectedRating);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setValue("category", category);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto text-center hover-scale transition-all duration-300">
        <CardContent className="pt-6">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-4">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)} 
            variant="outline"
          >
            Submit Another Feedback
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Feedback Guidelines */}
      <Card className="hover-scale transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-construction-orange" />
            Feedback Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What makes good feedback?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be specific about the issue or suggestion</li>
              <li>• Include steps to reproduce bugs</li>
              <li>• Mention your browser and device</li>
              <li>• Suggest improvements where possible</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Privacy & Data</h4>
            <p className="text-sm text-muted-foreground">
              Your feedback helps us improve UjenziPro. We treat all submissions confidentially 
              and use them solely for product development purposes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Response Time</h4>
            <p className="text-sm text-muted-foreground">
              We review all feedback within 48 hours. For urgent issues, please contact 
              our support team directly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <Card className="hover-scale transition-all duration-300">
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Your name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your.email@example.com"
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                  errors.email ? "border-destructive focus:ring-destructive/20" : ""
                }`}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger 
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    errors.category ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                  aria-describedby={errors.category ? "category-error" : undefined}
                >
                  <SelectValue placeholder="Select feedback category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p id="category-error" className="text-sm text-destructive" role="alert">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="Brief summary of your feedback"
                aria-describedby={errors.subject ? "subject-error" : undefined}
                className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                  errors.subject ? "border-destructive focus:ring-destructive/20" : ""
                }`}
              />
              {errors.subject && (
                <p id="subject-error" className="text-sm text-destructive" role="alert">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rating *</Label>
              <div 
                className="flex gap-1"
                role="radiogroup"
                aria-label="Rating from 1 to 5 stars"
                aria-describedby={errors.rating ? "rating-error" : undefined}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                    aria-label={`Rate ${star} out of 5 stars`}
                    role="radio"
                    aria-checked={rating === star}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-construction-orange text-construction-orange"
                          : "text-muted-foreground hover:text-construction-orange/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  You rated: {rating} out of 5 stars
                </p>
              )}
              {errors.rating && (
                <p id="rating-error" className="text-sm text-destructive" role="alert">
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Tell us about your experience, suggestions, or any issues you encountered..."
                rows={4}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none ${
                  errors.message ? "border-destructive focus:ring-destructive/20" : ""
                }`}
              />
              {errors.message && (
                <p id="message-error" className="text-sm text-destructive" role="alert">
                  {errors.message.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}