
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Survey = () => {
  const [formData, setFormData] = useState({
    name: '',
    age_group: '',
    usage_duration: '',
    usage_reason: [] as string[],
    content_preference: [] as string[],
    regular_bots_or_channels: '',
    recommend_telegram: '',
    improvement_suggestions: '',
    other_usage_reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const ageGroups = [
    'Under 18',
    '18–24',
    '25–34',
    '35–44',
    '45+'
  ];

  const usageDurations = [
    'Less than 6 months',
    '6 months – 1 year',
    '1–3 years',
    'More than 3 years'
  ];

  const usageReasons = [
    'To join groups and channels',
    'For privacy and security',
    'For cloud-based messaging',
    'To download movies, web series, or books',
    'For business/marketing purposes',
    'To chat with friends',
    'For bots and automation',
    'Other'
  ];

  const contentPreferences = [
    '📽 Movies & Web Series',
    '📚 E-books & Study Material',
    '🎓 Educational Content',
    '📰 News & Updates',
    '💸 Job Alerts',
    '🎮 Gaming Tips',
    '💬 Motivational Quotes',
    '🤖 Useful Bots',
    '📱 Tech Updates',
    '🎧 Music & Podcasts'
  ];

  const recommendOptions = ['Yes', 'No', 'Maybe'];

  const handleMultipleChoice = (value: string, field: 'usage_reason' | 'content_preference') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.age_group || !formData.usage_duration || !formData.recommend_telegram) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.usage_reason.length === 0 || formData.content_preference.length === 0) {
      toast({
        title: "Missing selections",
        description: "Please select at least one option for usage reason and content preference.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const finalUsageReasons = formData.usage_reason.includes('Other') && formData.other_usage_reason
        ? [...formData.usage_reason.filter(r => r !== 'Other'), formData.other_usage_reason]
        : formData.usage_reason;

      const { error } = await supabase
        .from('telegram_survey')
        .insert({
          name: formData.name || null,
          age_group: formData.age_group,
          usage_duration: formData.usage_duration,
          usage_reason: finalUsageReasons,
          content_preference: formData.content_preference,
          regular_bots_or_channels: formData.regular_bots_or_channels || null,
          recommend_telegram: formData.recommend_telegram,
          improvement_suggestions: formData.improvement_suggestions || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you for submitting the survey!",
        description: "Your response has been recorded successfully."
      });

      // Reset form
      setFormData({
        name: '',
        age_group: '',
        usage_duration: '',
        usage_reason: [],
        content_preference: [],
        regular_bots_or_channels: '',
        recommend_telegram: '',
        improvement_suggestions: '',
        other_usage_reason: ''
      });

    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold">Telegram User Survey</CardTitle>
            <p className="text-blue-100">Help us understand how you use Telegram</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>

              {/* Age Group */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Age Group *</Label>
                <RadioGroup
                  value={formData.age_group}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, age_group: value }))}
                >
                  {ageGroups.map((age) => (
                    <div key={age} className="flex items-center space-x-2">
                      <RadioGroupItem value={age} id={age} />
                      <Label htmlFor={age}>{age}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Usage Duration */}
              <div className="space-y-3">
                <Label className="text-base font-medium">How long have you been using Telegram? *</Label>
                <RadioGroup
                  value={formData.usage_duration}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, usage_duration: value }))}
                >
                  {usageDurations.map((duration) => (
                    <div key={duration} className="flex items-center space-x-2">
                      <RadioGroupItem value={duration} id={duration} />
                      <Label htmlFor={duration}>{duration}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Usage Reasons */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Why do you use Telegram the most? * (Multiple choice)</Label>
                <div className="grid grid-cols-1 gap-3">
                  {usageReasons.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <Checkbox
                        id={reason}
                        checked={formData.usage_reason.includes(reason)}
                        onCheckedChange={() => handleMultipleChoice(reason, 'usage_reason')}
                      />
                      <Label htmlFor={reason}>{reason}</Label>
                    </div>
                  ))}
                </div>
                {formData.usage_reason.includes('Other') && (
                  <Input
                    placeholder="Please specify other reason..."
                    value={formData.other_usage_reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, other_usage_reason: e.target.value }))}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Content Preferences */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Which content do you like more on Telegram? * (Multiple choice)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contentPreferences.map((content) => (
                    <div key={content} className="flex items-center space-x-2">
                      <Checkbox
                        id={content}
                        checked={formData.content_preference.includes(content)}
                        onCheckedChange={() => handleMultipleChoice(content, 'content_preference')}
                      />
                      <Label htmlFor={content} className="text-sm">{content}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regular Bots/Channels */}
              <div className="space-y-2">
                <Label htmlFor="bots">Do you use any Telegram bots or channels regularly?</Label>
                <Input
                  id="bots"
                  value={formData.regular_bots_or_channels}
                  onChange={(e) => setFormData(prev => ({ ...prev, regular_bots_or_channels: e.target.value }))}
                  placeholder="e.g., @weatherbot, @newsbot, etc."
                />
              </div>

              {/* Recommendation */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Would you recommend Telegram to others? *</Label>
                <RadioGroup
                  value={formData.recommend_telegram}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recommend_telegram: value }))}
                >
                  {recommendOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`recommend-${option}`} />
                      <Label htmlFor={`recommend-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <Label htmlFor="suggestions">Any suggestions to improve Telegram?</Label>
                <Textarea
                  id="suggestions"
                  value={formData.improvement_suggestions}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvement_suggestions: e.target.value }))}
                  placeholder="Share your thoughts and suggestions..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  See Survey Results
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
