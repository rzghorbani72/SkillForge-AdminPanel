import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';

const authConfig = {
  providers: [
    CredentialProvider({
      credentials: {
        identifier: {
          label: 'Email or Phone',
          type: 'text',
          placeholder: 'Enter your email or phone'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials, req) {
        const { identifier, password } = credentials || {};
        // const isEmail = /\S+@\S+\.\S+/.test(identifier);
        // const isPhone = /^\+?[1-9]\d{1,14}$/.test(identifier);
        console.log('identifier', identifier);
        console.log('password', password);
        debugger;
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login-by-pass`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ identifier, password }),
              credentials: 'include' // This ensures cookies are sent with the request
            }
          );
          debugger;
          if (response.ok) {
            const user = await response.json();
            // Assuming the response contains user data
            debugger;
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.error('Error during authorization:', error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/' // Sign-in page
  }
} satisfies NextAuthConfig;

export default authConfig;
