import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import DeviceDetector from 'device-detector-js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { staggerContainer, staggerItem } from '../../lib/animations';
import { motion } from 'framer-motion';

type FeedbackType = 'general' | 'issue' | 'feature' | 'other';

interface FeedbackFormProps {
  initialType?: FeedbackType;
  onClose?: () => void;
}

export function FeedbackForm({ initialType = 'general', onClose }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(initialType);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // For bug reports
  const [browser, setBrowser] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');

  // Detect browser and OS using device-detector-js
  useEffect(() => {
    const detectDeviceInfo = () => {
      try {
        const deviceDetector = new DeviceDetector();
        const userAgent = navigator.userAgent;
        const device = deviceDetector.parse(userAgent);

        // Set browser info with version if available
        if (device.client && device.client.name) {
          const browserWithVersion = device.client.version
            ? `${device.client.name} ${device.client.version}`
            : device.client.name;
          setBrowser(browserWithVersion);
        }

        // Set OS info with version if available
        if (device.os && device.os.name) {
          const osWithVersion = device.os.version
            ? `${device.os.name} ${device.os.version}`
            : device.os.name;
          setOperatingSystem(osWithVersion);
        }
      } catch (error) {
        console.error("Error detecting device info:", error);
        // Fallback to basic detection in case device-detector fails
        setBrowser(navigator.userAgent);
        setOperatingSystem(navigator.platform || "Unknown");
      }
    };

    // Only detect if the fields are empty (first load or reset)
    if (!browser || !operatingSystem) {
      detectDeviceInfo();
    }
  }, [browser, operatingSystem]);

  // Add a more immediate way to handle initialType changes
  useEffect(() => {
    // Force immediate update when initialType changes
    setFeedbackType(initialType);

    // Reset form fields that are specific to certain feedback types
    if (initialType === 'general' || initialType === 'feature' || initialType === 'other') {
      // Clear fields that are only relevant for issue reports
      setBrowser('');
      setOperatingSystem('');
    } else if (initialType === 'issue') {
      // Re-detect device info when switching to issue reporting
      const detectDeviceInfo = () => {
        try {
          const deviceDetector = new DeviceDetector();
          const userAgent = navigator.userAgent;
          const device = deviceDetector.parse(userAgent);

          // Set browser info with version if available
          if (device.client && device.client.name) {
            const browserWithVersion = device.client.version
              ? `${device.client.name} ${device.client.version}`
              : device.client.name;
            setBrowser(browserWithVersion);
          }

          // Set OS info with version if available
          if (device.os && device.os.name) {
            const osWithVersion = device.os.version
              ? `${device.os.name} ${device.os.version}`
              : device.os.name;
            setOperatingSystem(osWithVersion);
          }
        } catch (error) {
          console.error("Error detecting device info:", error);
          setBrowser(navigator.userAgent);
          setOperatingSystem(navigator.platform || "Unknown");
        }
      };

      detectDeviceInfo();
    }
  }, [initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Create a URLSearchParams object directly
      const params = new URLSearchParams();
      params.append('form-name', 'feedback');
      params.append('name', name);
      params.append('email', email);
      params.append('feedbackType', feedbackType);
      params.append('feedback', feedback);

      // Add additional fields for issues
      if (feedbackType === 'issue') {
        params.append('browser', browser);
        params.append('operatingSystem', operatingSystem);
      }

      // Log submission for debugging
      console.log('Submitting form with data:', Object.fromEntries(params.entries()));

      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (response.ok) {
        console.log('Form submitted successfully');
        setSubmitStatus('success');
        // Reset form
        setName('');
        setEmail('');
        setFeedback('');
        setBrowser('');
        setOperatingSystem('');
      } else {
        console.error('Form submission failed:', response.status, response.statusText);
        throw new Error(`Form submission failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormTitle = () => {
    switch (feedbackType) {
      case 'issue':
        return 'Report an Issue';
      case 'feature':
        return 'Suggest a Feature';
      case 'other':
        return 'Submit Feedback';
      default:
        return 'Submit Feedback';
    }
  };

  const getPlaceholderText = () => {
    switch (feedbackType) {
      case 'issue':
        return 'Please describe the issue in detail. What were you trying to do? What happened instead?';
      case 'feature':
        return 'Please describe the feature you would like to see. How would it improve your experience?';
      case 'other':
        return 'Your thoughts, suggestions, or questions';
      default:
        return 'Your thoughts, suggestions, or feedback';
    }
  };

  const getSuccessMessage = () => {
    switch (feedbackType) {
      case 'issue':
        return 'Thank you for reporting this issue!';
      case 'feature':
        return 'Thank you for your feature suggestion!';
      default:
        return 'Thank you for your feedback!';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{getFormTitle()}</h2>

      {submitStatus === 'success' ? (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md p-4 mb-4 flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5" />
          <div>
            <p className="text-green-700 dark:text-green-300 font-medium">{getSuccessMessage()}</p>
            <p className="text-green-600 dark:text-green-400 text-sm mt-1">Your input helps us improve Transcriptr.</p>
          </div>
        </div>
      ) : (
        <motion.form
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          name="feedback"
          method="post"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          className="space-y-4"
        >
          {/* These hidden fields are crucial for Netlify form handling */}
          <input type="hidden" name="form-name" value="feedback" />
          <input type="hidden" name="feedbackType" value={feedbackType} />
          <div className="hidden">
            <label>
              Don't fill this out if you're human: <input name="bot-field" />
            </label>
          </div>

          <div>
            <Label htmlFor="feedback-type" className="block text-sm font-medium mb-1">
              Type of Feedback
            </Label>
            <Select
              value={feedbackType}
              onValueChange={(value) => setFeedbackType(value as FeedbackType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="issue">Report an Issue</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <motion.div variants={staggerItem}>
            <div>
              <Label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full"
              />
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-1">
                Email <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We only use your email if we need to contact you about your {feedbackType === 'issue' ? 'issue' : 'feedback'}.
              </p>
            </div>
          </motion.div>

          {feedbackType === 'issue' && (
            <>
              <motion.div variants={staggerItem}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="browser" className="block text-sm font-medium mb-1">
                      Browser <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">(auto-detected)</span>
                    </Label>
                    <Input
                      id="browser"
                      name="browser"
                      type="text"
                      value={browser}
                      onChange={(e) => setBrowser(e.target.value)}
                      placeholder="Chrome, Firefox, etc."
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating-system" className="block text-sm font-medium mb-1">
                      Operating System <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">(auto-detected)</span>
                    </Label>
                    <Input
                      id="operating-system"
                      name="operatingSystem"
                      type="text"
                      value={operatingSystem}
                      onChange={(e) => setOperatingSystem(e.target.value)}
                      placeholder="Windows, macOS, etc."
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}

          <motion.div variants={staggerItem}>
            <div>
              <Label htmlFor="feedback" className="block text-sm font-medium mb-1">
                {feedbackType === 'issue' ? 'Issue Details' : feedbackType === 'feature' ? 'Feature Suggestion' : 'Feedback'}
              </Label>
              <Textarea
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={getPlaceholderText()}
                required
                className="w-full min-h-[120px]"
              />
            </div>
          </motion.div>

          {submitStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">Failed to submit</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errorMessage || 'Please try again later'}</p>
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
              disabled={isSubmitting}
              className={onClose ? "flex-1" : "w-full"}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </motion.form>
      )}
    </div>
  );
}