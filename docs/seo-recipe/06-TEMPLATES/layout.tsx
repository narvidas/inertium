/**
 * Layout for SEO Pages
 *
 * Wraps all SEO pages with header and footer.
 * Copy to: /src/app/use-cases/layout.tsx
 *
 * CUSTOMISATION:
 * 1. Import your own Header and Footer components
 * 2. Add any additional layout elements (navigation, sidebar, etc.)
 */

// UPDATE: Import your own Header and Footer components
// import { Header } from "@/components/Header";
// import { Footer } from "@/components/Footer";

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* UPDATE: Uncomment and use your Header component */}
      {/* <Header /> */}

      {/* Placeholder header - replace with your component */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="text-xl font-bold text-slate-900">
              YourBrand
            </a>
            <nav className="flex gap-6">
              <a
                href="/use-cases"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Use Cases
              </a>
              <a
                href="/pricing"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Pricing
              </a>
              <a
                href="/about"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Page content */}
      {children}

      {/* UPDATE: Uncomment and use your Footer component */}
      {/* <Footer /> */}

      {/* Placeholder footer - replace with your component */}
      <footer className="border-t border-gray-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} YourBrand. All rights reserved.
            </p>
            <nav className="flex gap-6">
              <a
                href="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Terms
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

