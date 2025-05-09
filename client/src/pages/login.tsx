import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  rememberMe: z.boolean().default(false),
});

const Login: React.FC = () => {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoginError(null);
      await login(values.username, values.password);
      setLocation('/');
    } catch (error) {
      setLoginError("Invalid username or password. Please try again.");
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">LawnMates</h1>
          <p className="text-neutral-600 mt-1">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-primary-600 hover:text-primary-500"
                onClick={() => setLocation('/register')}
              >
                Sign up
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
