import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, CheckCircle2, Send, Bug, Zap, MessageSquare } from 'lucide-react';
import { getSystemInfo } from './issue-templates';

interface IssueReportManagerProps {
  initialCategory?: 'ui-bug' | 'feature-request' | 'accessibility' | 'mobile' | 'other';
  onClose?: () => void;
}

export function IssueReportManager({ initialCategory = 'other', onClose }: IssueReportManagerProps) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'ui-bug' | 'feature-request' | 'accessibility' | 'mobile' | 'other'>(initialCategory);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [reproducible, setReproducible] = useState<boolean>(true);
  const [stepsToReproduce, setStepsToReproduce] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const systemInfo = getSystemInfo();
      
      // Submit to Netlify Forms (works without GitHub account)
      const formData = new FormData();
      formData.append('form-name', 'issue-report');
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('severity', severity);
      formData.append('reproducible', reproducible.toString());
      formData.append('user-name', userName);
      formData.append('user-email', userEmail);
      formData.append('steps-to-reproduce', stepsToReproduce);
      formData.append('timestamp', systemInfo.timestamp.toISOString());
      formData.append('user-agent', systemInfo.userAgent);
      formData.append('url', systemInfo.url);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString()
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        throw new Error('Failed to submit issue report');
      }
    } catch (error) {
      console.error('Error submitting issue report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryDescription = (cat: string) => {
    switch (cat) {
      case 'ui-bug': return 'Something in the user interface is broken or not working correctly';
      case 'feature-request': return 'Suggest a new feature or improvement';
      case 'accessibility': return 'Issues related to accessibility or usability';
      case 'mobile': return 'Issues specific to mobile devices or responsive design';
      case 'other': return 'General issues that don\'t fit other categories';
      default: return '';
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="flex items-start rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/30">
          <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 text-green-500 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-300">
              Issue Report Created!
            </p>
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              Your issue has been submitted successfully. The development team will review it and respond as soon as possible.
            </p>
          </div>
        </div>
        {onClose && (
          <Button onClick={onClose} className="mt-4 w-full">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-4 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Report an Issue
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="category" className="mb-1 block text-sm font-medium">
            Issue Category
          </Label>
          <Select value={category} onValueChange={(value: string) => setCategory(value as 'ui-bug' | 'feature-request' | 'accessibility' | 'mobile' | 'other')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select issue category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="ui-bug">
                <div className="flex items-center">
                  <Bug className="mr-2 h-4 w-4" />
                  UI Bug
                </div>
              </SelectItem>
              <SelectItem value="feature-request">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Feature Request
                </div>
              </SelectItem>
              <SelectItem value="accessibility">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Accessibility
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mobile Issue
                </div>
              </SelectItem>
              <SelectItem value="other">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Other
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {getCategoryDescription(category)}
          </p>
        </div>

        <div>
          <Label htmlFor="severity" className="mb-1 block text-sm font-medium">
            Severity
          </Label>
          <Select value={severity} onValueChange={(value: string) => setSeverity(value as 'low' | 'medium' | 'high' | 'critical')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="low">🟢 Low - Minor issue</SelectItem>
              <SelectItem value="medium">🟡 Medium - Moderate issue</SelectItem>
              <SelectItem value="high">🔴 High - Major issue</SelectItem>
              <SelectItem value="critical">🚨 Critical - Blocking issue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title" className="mb-1 block text-sm font-medium">
            Issue Title
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            required
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue. What happened? What did you expect to happen?"
            required
            className="min-h-[100px] w-full"
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm font-medium">
            Is this issue reproducible?
          </Label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="reproducible"
                checked={reproducible}
                onChange={() => setReproducible(true)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="reproducible"
                checked={!reproducible}
                onChange={() => setReproducible(false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>

        {reproducible && (
          <div>
            <Label htmlFor="steps" className="mb-1 block text-sm font-medium">
              Steps to Reproduce <span className="text-gray-500 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="steps"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              className="min-h-[80px] w-full"
            />
          </div>
        )}

        <div>
          <Label htmlFor="user-name" className="mb-1 block text-sm font-medium">
            Name <span className="text-gray-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="user-name"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="user-email" className="mb-1 block text-sm font-medium">
            Email <span className="text-gray-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="user-email"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            We'll only use this to follow up on your report if needed.
          </p>
        </div>

        {submitStatus === 'error' && (
          <div className="flex items-start rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/30">
            <AlertCircle className="mt-0.5 mr-3 h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                Failed to create issue report
              </p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Please try again or contact support directly.
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className={onClose ? "flex-1" : "w-full"}
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Issue
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Your issue report will be submitted directly to the development team.
        </p>
      </div>
    </div>
  );
}