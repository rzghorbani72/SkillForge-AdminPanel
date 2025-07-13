'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, ArrowLeft, Home, School } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this area
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <span>Unauthorized Access</span>
            </CardTitle>
            <CardDescription>
              This admin panel is restricted to teachers, managers, and administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Students:</strong> Please access your learning dashboard through your school's website.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What you can do:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Access your school's student dashboard</li>
                  <li>• Contact your school administrator</li>
                  <li>• Register as a teacher if you're an educator</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-900 mb-2">Need help?</h3>
                <p className="text-sm text-orange-800">
                  If you believe you should have access to this panel, please contact your school administrator or our support team.
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/find-school">
                <Button className="w-full" variant="outline">
                  <School className="h-4 w-4 mr-2" />
                  Find My School
                </Button>
              </Link>
              
              <Link href="/register">
                <Button className="w-full">
                  Register as Teacher
                </Button>
              </Link>
              
              <Link href="/login">
                <Button className="w-full" variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need assistance?{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-500 underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 