import Link from 'next/link';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4">
      <nav className="flex w-full justify-end px-8 py-6">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
        >
          Login
        </Link>
      </nav>
      <section className="mt-12 flex flex-col items-center text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-gray-900 drop-shadow-lg md:text-6xl">
          Welcome to SkillForge
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-700 md:text-2xl">
          Empower your learning journey. Create, manage, and sell your online
          courses with ease. SkillForge is your all-in-one platform for building
          a thriving online education business.
        </p>
        <Link
          href="/login"
          className="mb-4 rounded-xl bg-blue-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700"
        >
          Get Started / Login
        </Link>
      </section>
      <footer className="mt-auto py-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} SkillForge. All rights reserved.
      </footer>
    </main>
  );
}
