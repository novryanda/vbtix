"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Mail, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function EmailDebugPage() {
  const [testEmail, setTestEmail] = useState("novryandareza0@gmail.com");
  const [testType, setTestType] = useState("simple");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runEmailTest = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/debug/email-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testEmail,
          testType,
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean | null) => {
    if (success === null) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (success: boolean | null) => {
    if (success === null) return "Not tested";
    return success ? "Success" : "Failed";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Email Service Debug</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Delivery Test</CardTitle>
          <CardDescription>
            Test email delivery functionality to diagnose issues with organizer order email delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address to test"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Email</SelectItem>
                  <SelectItem value="ticket">Ticket Email</SelectItem>
                  <SelectItem value="pdf">PDF Ticket Email</SelectItem>
                  <SelectItem value="all">All Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={runEmailTest} disabled={isLoading || !testEmail} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Email Test...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Run Email Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Comprehensive email delivery test results and diagnostics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!results.success ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Test failed: {results.error}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Environment Check */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Environment Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(results.data.steps.environmentCheck).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {getStatusIcon(typeof value === 'string' && value.includes('✅'))}
                        <span className="font-mono">{key}:</span>
                        <span>{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Results Summary */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Test Results Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(results.data.summary).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {getStatusIcon(value as boolean)}
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span>{getStatusText(value as boolean)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Results */}
                {results.data.steps.resendConnection && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Resend API Connection</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre>{JSON.stringify(results.data.steps.resendConnection, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {results.data.steps.simpleEmail && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Simple Email Result</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre>{JSON.stringify(results.data.steps.simpleEmail, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {results.data.steps.pdfEmail && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">PDF Email Result</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre>{JSON.stringify(results.data.steps.pdfEmail, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.data.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Recommendations</h3>
                    <div className="space-y-1">
                      {results.data.recommendations.map((rec: string, index: number) => (
                        <Alert key={index} variant={rec.includes('✅') ? 'default' : 'destructive'}>
                          <AlertDescription>{rec}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold">Common Issues:</h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Resend API Error:</strong> Check if RESEND_API_KEY is valid and not expired</li>
              <li><strong>Domain Issues:</strong> Verify that EMAIL_FROM domain is verified in Resend</li>
              <li><strong>Rate Limiting:</strong> Resend has rate limits - wait before retrying</li>
              <li><strong>PDF Generation:</strong> Large PDFs may cause timeouts or memory issues</li>
              <li><strong>Email Filtering:</strong> Check spam/junk folders for test emails</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Next Steps:</h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Run the simple email test first to verify basic connectivity</li>
              <li>If simple email works, test ticket email without PDF</li>
              <li>Finally test PDF email delivery if other tests pass</li>
              <li>Check the browser console and server logs for detailed error messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
