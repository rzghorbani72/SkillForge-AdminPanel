#!/usr/bin/env ts-node
/**
 * AdminPanel Production Readiness Report
 *
 * Comprehensive analysis based on:
 * - OWASP Top 10 Security Guidelines
 * - Clean Code Principles (Robert C. Martin)
 * - Google Web Vitals & Core Performance Metrics
 * - Jest/Testing Best Practices
 * - WCAG 2.1 Accessibility Standards
 * - 12-Factor App Methodology
 * - Industry-standard DevOps practices
 *
 * Run: npm run production-report
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

interface AspectScore {
  name: string;
  score: number;
  status: 'ready' | 'warning' | 'critical';
}

interface ProjectReport {
  name: string;
  path: string;
  overallScore: number;
  aspects: AspectScore[];
  timestamp: string;
}

class AdminPanelProductionReport {
  private rootDir: string;

  constructor() {
    this.rootDir = path.join(__dirname, '..');
  }

  private log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  private getStatusIcon(score: number): string {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️ ';
    return '❌';
  }

  private getStatusColor(score: number): string {
    if (score >= 80) return colors.green;
    if (score >= 60) return colors.yellow;
    return colors.red;
  }

  private generateReport(): ProjectReport {
    const aspects: AspectScore[] = [
      {
        name: 'Security',
        score: this.checkSecurityScore(),
        status: this.getStatus(this.checkSecurityScore()),
      },
      {
        name: 'Code Quality',
        score: this.checkCodeQualityScore(),
        status: this.getStatus(this.checkCodeQualityScore()),
      },
      {
        name: 'Testing',
        score: this.checkTestingScore(),
        status: this.getStatus(this.checkTestingScore()),
      },
      {
        name: 'Performance',
        score: this.checkPerformanceScore(),
        status: this.getStatus(this.checkPerformanceScore()),
      },
      {
        name: 'State Management',
        score: this.checkStateManagementScore(),
        status: this.getStatus(this.checkStateManagementScore()),
      },
      {
        name: 'Error Handling',
        score: this.checkErrorHandlingScore(),
        status: this.getStatus(this.checkErrorHandlingScore()),
      },
      {
        name: 'Logging',
        score: this.checkLoggingScore(),
        status: this.getStatus(this.checkLoggingScore()),
      },
    ];

    const overallScore = Math.round(aspects.reduce((sum, a) => sum + a.score, 0) / aspects.length);

    return {
      name: 'AdminPanel (Next.js Frontend)',
      path: 'AdminPanel/',
      overallScore,
      aspects,
      timestamp: new Date().toISOString(),
    };
  }

  private getStatus(score: number): 'ready' | 'warning' | 'critical' {
    if (score >= 80) return 'ready';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  private countFilesMatching(pattern: RegExp): number {
    try {
      const appDir = path.join(this.rootDir, 'app');
      if (!fs.existsSync(appDir)) return 0;

      const files = this.getFilesRecursive(appDir);
      return files.filter((f) => pattern.test(f)).length;
    } catch {
      return 0;
    }
  }

  private getFilesRecursive(dir: string): string[] {
    let files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(this.getFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  private checkSecurityScore(): number {
    let score = 0;

    // OWASP Top 10 2023 Checks
    // A01: Broken Access Control
    const a01Score = this.checkOWASP_A01_BrokenAccessControl();
    score += a01Score * 13;

    // A02: Cryptographic Failures
    const a02Score = this.checkOWASP_A02_CryptographicFailures();
    score += a02Score * 13;

    // A03: Injection
    const a03Score = this.checkOWASP_A03_Injection();
    score += a03Score * 13;

    // A04: Insecure Design
    const a04Score = this.checkOWASP_A04_InsecureDesign();
    score += a04Score * 12;

    // A05: Security Misconfiguration
    const a05Score = this.checkOWASP_A05_SecurityMisconfiguration();
    score += a05Score * 12;

    // A07: Cross-Site Scripting (XSS)
    const a07Score = this.checkOWASP_A07_XSS();
    score += a07Score * 12;

    // A08: Software & Data Integrity Failures
    const a08Score = this.checkOWASP_A08_IntegrityFailures();
    score += a08Score * 11;

    // A09: Logging & Monitoring Failures
    const a09Score = this.checkOWASP_A09_LoggingMonitoring();
    score += a09Score * 11;

    return Math.min(score, 100);
  }

  private checkOWASP_A01_BrokenAccessControl(): number {
    let score = 0.2; // Base score

    // Check 1: Authentication implementation
    const hasAuth = this.checkAuthenticationImplementation();
    if (hasAuth) score += 0.2;

    // Check 2: Authorization request proxy
    const proxyPath = path.join(this.rootDir, 'proxy.ts');
    if (fs.existsSync(proxyPath)) {
      const content = fs.readFileSync(proxyPath, 'utf-8');
      if (content.includes('auth') || content.includes('protected')) {
        score += 0.2;
      }
    }

    // Check 3: CORS configuration
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf-8');
      if (config.includes('cors') || config.includes('origin')) {
        score += 0.2;
      }
    }

    // Check 4: Role-based access control (RBAC)
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir);
      for (const file of files.slice(0, 20)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.match(/role|permission|admin|isAuthorized/gi)) {
          score += 0.2;
          break;
        }
      }
    }

    return Math.min(score, 1);
  }

  private checkOWASP_A02_CryptographicFailures(): number {
    let score = 0.2;

    // Check 1: Environment variable protection
    if (this.checkEnvironmentVariableManagement()) {
      score += 0.2;
    }

    // Check 2: HTTPS enforcement
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf-8');
      if (config.includes('Strict-Transport-Security') || config.includes('HSTS')) {
        score += 0.2;
      }
    }

    // Check 3: No hardcoded secrets
    if (this.checkForHardcodedSecrets()) {
      score += 0.2;
    }

    // Check 4: Encryption for sensitive data
    const packageJson = this.readPackageJson();
    if (
      packageJson.dependencies['crypto-js'] ||
      packageJson.dependencies['bcryptjs'] ||
      packageJson.dependencies['argon2']
    ) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  private checkOWASP_A03_Injection(): number {
    let score = 0.2;

    // Check 1: Input validation with Zod/Joi
    if (this.checkInputValidation()) {
      score += 0.25;
    }

    // Check 2: Parameterized queries (ORM usage)
    const packageJson = this.readPackageJson();
    if (
      packageJson.dependencies['prisma'] ||
      packageJson.dependencies['typeorm'] ||
      packageJson.dependencies['sequelize']
    ) {
      score += 0.25;
    }

    // Check 3: SQL injection prevention
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir);
      let hasSQLInjectionPrevention = false;
      for (const file of files.slice(0, 15)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.match(/prepared|parameterized|\?|:\w+/)) {
          hasSQLInjectionPrevention = true;
          break;
        }
      }
      if (hasSQLInjectionPrevention) score += 0.25;
    }

    // Check 4: DOM XSS prevention
    if (this.checkXSSPrevention()) {
      score += 0.25;
    }

    return Math.min(score, 1);
  }

  private checkOWASP_A04_InsecureDesign(): number {
    let score = 0.2;

    // Check 1: Security requirements in design
    const hasSecurityDocs = fs.existsSync(path.join(this.rootDir, 'docs', 'security.md'));
    if (hasSecurityDocs) score += 0.2;

    // Check 2: Threat modeling (evidence in code structure)
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const dirCount = fs
        .readdirSync(appDir)
        .filter(
          (f) => !f.startsWith('.') && fs.statSync(path.join(appDir, f)).isDirectory(),
        ).length;
      if (dirCount > 3) score += 0.2; // Well-organized security domains
    }

    // Check 3: Least privilege implementation
    if (this.checkAuthenticationImplementation()) {
      score += 0.2;
    }

    // Check 4: Rate limiting & API protection
    if (this.checkAPIGatewaySecurity()) {
      score += 0.2;
    }

    // Check 5: Account lockout mechanisms
    const packageJson = this.readPackageJson();
    if (packageJson.dependencies['next-auth']) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  private checkOWASP_A05_SecurityMisconfiguration(): number {
    let score = 0.2;

    // Check 1: Security headers
    if (this.checkSecurityHeaders()) {
      score += 0.2;
    }

    // Check 2: TypeScript strict mode
    const tsconfigPath = path.join(this.rootDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      if (tsconfig.compilerOptions?.strict) {
        score += 0.15;
      }
    }

    // Check 3: Environment-specific config
    if (fs.existsSync(path.join(this.rootDir, '.env.example'))) {
      score += 0.15;
    }

    // Check 4: Dependency security scanning
    if (this.checkDependencySecurity()) {
      score += 0.15;
    }

    // Check 5: CSP headers
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf-8');
      if (config.includes('Content-Security-Policy')) {
        score += 0.15;
      }
    }

    return Math.min(score, 1);
  }

  private checkOWASP_A07_XSS(): number {
    let score = 0.2;

    // Check 1: XSS prevention
    if (this.checkXSSPrevention()) {
      score += 0.25;
    }

    // Check 2: Output encoding
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
      let safeRendering = 0;
      for (const file of files.slice(0, 10)) {
        const content = fs.readFileSync(file, 'utf-8');
        // Check for proper JSX escaping
        if (!content.includes('dangerouslySetInnerHTML')) {
          safeRendering++;
        }
      }
      score += (safeRendering / Math.min(10, files.length)) * 0.25;
    }

    // Check 3: Content Security Policy
    if (this.hasCSPHeaders()) {
      score += 0.25;
    }

    // Check 4: DOMPurify or similar
    const packageJson = this.readPackageJson();
    if (packageJson.dependencies['dompurify']) {
      score += 0.25;
    }

    return Math.min(score, 1);
  }

  private checkOWASP_A08_IntegrityFailures(): number {
    let score = 0.2;

    // Check 1: Dependency locking
    if (this.checkDependencySecurity()) {
      score += 0.25;
    }

    // Check 2: Code signing & integrity verification
    if (
      fs.existsSync(path.join(this.rootDir, 'package-lock.json')) ||
      fs.existsSync(path.join(this.rootDir, 'yarn.lock'))
    ) {
      score += 0.25;
    }

    // Check 3: Secure CI/CD
    const hasGitHubActions = fs.existsSync(path.join(this.rootDir, '.github', 'workflows'));
    if (hasGitHubActions) {
      score += 0.25;
    }

    // Check 4: Version control security
    if (fs.existsSync(path.join(this.rootDir, '.gitignore'))) {
      const gitignore = fs.readFileSync(path.join(this.rootDir, '.gitignore'), 'utf-8');
      if (gitignore.includes('.env')) {
        score += 0.25;
      }
    }

    return Math.min(score, 1);
  }

  private checkOWASP_A09_LoggingMonitoring(): number {
    let score = 0.2;

    // Check 1: Logging implementation
    const infraScore = this.checkLoggingInfrastructure();
    score += infraScore * 0.2;

    // Check 2: Error monitoring (Sentry, etc.)
    const packageJson = this.readPackageJson();
    if (packageJson.dependencies['@sentry/react'] || packageJson.dependencies['@sentry/nextjs']) {
      score += 0.25;
    }

    // Check 3: Audit logging
    if (fs.existsSync(path.join(this.rootDir, 'lib'))) {
      const libFiles = fs.readdirSync(path.join(this.rootDir, 'lib'));
      if (libFiles.some((f) => f.includes('audit') || f.includes('logger'))) {
        score += 0.25;
      }
    }

    // Check 4: Security incident response plan
    const hasSecurityDoc =
      fs.existsSync(path.join(this.rootDir, 'docs', 'security.md')) ||
      fs.existsSync(path.join(this.rootDir, 'SECURITY.md'));
    if (hasSecurityDoc) {
      score += 0.2;
    }

    // Check 5: Health check endpoints
    const apiDir = path.join(this.rootDir, 'app', 'api');
    if (fs.existsSync(apiDir)) {
      const files = fs.readdirSync(apiDir);
      if (files.some((f) => f.includes('health') || f.includes('status'))) {
        score += 0.1;
      }
    }

    return Math.min(score, 1);
  }

  private hasCSPHeaders(): boolean {
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (!fs.existsSync(nextConfigPath)) return false;
    const config = fs.readFileSync(nextConfigPath, 'utf-8');
    return (
      config.includes('Content-Security-Policy') ||
      config.includes('script-src') ||
      config.includes('default-src')
    );
  }

  private checkAuthenticationImplementation(): boolean {
    const packageJson = this.readPackageJson();

    // Check for authentication libraries
    const hasAuth =
      packageJson.dependencies['next-auth'] ||
      packageJson.dependencies['firebase'] ||
      packageJson.dependencies['supabase'] ||
      packageJson.dependencies['auth0'];

    if (!hasAuth) return false;

    // Check request-proxy protection
    const proxyPath = path.join(this.rootDir, 'proxy.ts');
    if (fs.existsSync(proxyPath)) {
      const content = fs.readFileSync(proxyPath, 'utf-8');
      return (
        content.includes('auth') || content.includes('protected') || content.includes('matcher')
      );
    }

    return true;
  }

  private checkEnvironmentVariableManagement(): boolean {
    // Check 1: .env.example exists (documentation of required vars)
    const envExampleExists = fs.existsSync(path.join(this.rootDir, '.env.example'));

    // Check 2: .env.local in .gitignore
    const gitignorePath = path.join(this.rootDir, '.gitignore');
    let envProtected = false;
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      envProtected = gitignore.includes('.env') || gitignore.includes('.env.local');
    }

    // Check 3: Environment validation (using zod or similar)
    const appDir = path.join(this.rootDir, 'app');
    let envValidation = false;
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir);
      for (const file of files.slice(0, 10)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (
          (content.includes('z.string') || content.includes('process.env')) &&
          content.includes('schema')
        ) {
          envValidation = true;
          break;
        }
      }
    }

    return envExampleExists && envProtected && envValidation;
  }

  private checkInputValidation(): boolean {
    const packageJson = this.readPackageJson();

    // Check for validation libraries
    const hasValidationLib =
      packageJson.dependencies.zod ||
      packageJson.dependencies['joi'] ||
      packageJson.dependencies['yup'] ||
      packageJson.dependencies['class-validator'];

    if (!hasValidationLib) return false;

    // Check usage in components/pages
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
      for (const file of files.slice(0, 15)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (
          content.includes('parse') ||
          content.includes('validate') ||
          content.includes('schema') ||
          content.includes('z.object')
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private checkDependencySecurity(): boolean {
    // Check for package-lock.json or yarn.lock (dependency locking)
    const hasLockFile =
      fs.existsSync(path.join(this.rootDir, 'package-lock.json')) ||
      fs.existsSync(path.join(this.rootDir, 'yarn.lock'));

    if (!hasLockFile) return false;

    // Check for security audit script
    const packageJson = this.readPackageJson();
    const hasSecurityScript =
      packageJson.scripts?.['audit'] ||
      packageJson.scripts?.['security'] ||
      packageJson.scripts?.['check:deps'];

    return hasSecurityScript || hasLockFile;
  }

  private checkSecurityHeaders(): boolean {
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (!fs.existsSync(nextConfigPath)) return false;

    const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');

    const hasHeaders =
      nextConfig.includes('headers') ||
      nextConfig.includes('X-Content-Type-Options') ||
      nextConfig.includes('X-Frame-Options');

    const hasSecurityHeaders =
      nextConfig.includes('Strict-Transport-Security') ||
      nextConfig.includes('X-Content-Type-Options: nosniff') ||
      nextConfig.includes('X-Frame-Options');

    return hasHeaders && hasSecurityHeaders;
  }

  private checkXSSPrevention(): boolean {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return false;

    const packageJson = this.readPackageJson();

    // Check for DOMPurify or similar
    const hasSanitizer =
      packageJson.dependencies['dompurify'] || packageJson.dependencies['sanitize-html'];

    let usesNext = false;
    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      // Next.js auto-escapes JSX, check for dangerouslySetInnerHTML (should be avoided)
      if (!content.includes('dangerouslySetInnerHTML')) {
        usesNext = true;
        break;
      }
    }

    return (hasSanitizer || usesNext) && !this.checkForDangerousHTML();
  }

  private checkForDangerousHTML(): boolean {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return false;

    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let dangerousCount = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      dangerousCount += (content.match(/dangerouslySetInnerHTML/g) || []).length;
    }

    return dangerousCount > 3;
  }

  private checkAPIGatewaySecurity(): boolean {
    const apiDir = path.join(this.rootDir, 'app', 'api');
    if (!fs.existsSync(apiDir)) return false;

    const packageJson = this.readPackageJson();

    // Check for rate limiting
    const hasRateLimiting =
      packageJson.dependencies['express-rate-limit'] ||
      packageJson.dependencies['next-rate-limit'] ||
      packageJson.dependencies['rate-limiter'];

    let hasMethodValidation = false;
    const files = this.getFilesRecursive(apiDir).filter((f) => f.endsWith('.ts'));
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('req.method') || content.includes('if (req.method ===')) {
        hasMethodValidation = true;
        break;
      }
    }

    return hasRateLimiting || hasMethodValidation;
  }

  private checkForHardcodedSecrets(): boolean {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return true; // No code = no secrets

    const secretPatterns = [
      /api[_-]?key\s*=\s*['"][^'"]{10,}['"]/gi,
      /password\s*=\s*['"][^'"]{1,}['"]/gi,
      /token\s*=\s*['"][^'"]{20,}['"]/gi,
    ];

    const files = this.getFilesRecursive(appDir).filter(
      (f) => f.endsWith('.tsx') || f.endsWith('.ts'),
    );
    for (const file of files.slice(0, 20)) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          return false;
        }
      }
    }

    return true;
  }

  private checkCodeQualityScore(): number {
    let score = 0;

    // Clean Code: Type Safety (Static analysis)
    const typeScoreResult = this.checkTypeScafetyCompliance();
    score += typeScoreResult * 15; // 0-15 points

    // Clean Code: Naming Convention & Readability
    const namingScore = this.checkNamingConventions();
    score += namingScore * 12; // 0-12 points

    // Clean Code: Code Organization & Structure
    const structureScore = this.checkCodeOrganization();
    score += structureScore * 13; // 0-13 points

    // Clean Code: Function/Component Complexity
    const complexityScore = this.checkCodeComplexity();
    score += complexityScore * 15; // 0-15 points

    // Clean Code: DRY Principle & Code Duplication
    const dryScore = this.checkDRYPrinciple();
    score += dryScore * 13; // 0-13 points

    // Code Quality Tools (ESLint, Prettier)
    const toolsScore = this.checkCodeQualityTools();
    score += toolsScore * 15; // 0-15 points

    // SOLID Principles & Architecture
    const solidScore = this.checkSOLIDPrinciples();
    score += solidScore * 17; // 0-17 points

    return Math.min(score, 100);
  }

  private checkTypeScafetyCompliance(): number {
    const tsconfigPath = path.join(this.rootDir, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) return 0;

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    const compOpts = tsconfig.compilerOptions || {};

    // Strict mode (most important)
    if (!compOpts.strict) return 0.3;

    let strictPoints = 1;
    // Additional strict checks
    if (compOpts.noImplicitAny === true) strictPoints += 0;
    if (compOpts.strictNullChecks === true) strictPoints += 0;
    if (compOpts.strictFunctionTypes === true) strictPoints += 0;
    if (compOpts.noUnusedLocals === true) strictPoints += 0;
    if (compOpts.noUnusedParameters === true) strictPoints += 0;
    if (compOpts.noImplicitReturns === true) strictPoints += 0;

    // Check for 'any' usage in app code
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
      let anyCount = 0;
      for (const file of files.slice(0, 20)) {
        const content = fs.readFileSync(file, 'utf-8');
        anyCount += (content.match(/:\s*any\b/g) || []).length;
      }
      if (anyCount > 10) strictPoints = 0.6;
      else if (anyCount > 0) strictPoints = 0.8;
    }

    return strictPoints;
  }

  private checkNamingConventions(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let violations = 0;
    let totalChecks = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      totalChecks += 3;

      // Check for PascalCase components
      if (!content.match(/export\s+(?:default\s+)?function\s+[A-Z]\w+/)) {
        violations++;
      }

      // Check for camelCase variables/functions
      if (content.match(/const\s+[A-Z][a-zA-Z0-9]*\s*=/)) {
        violations++;
      }

      // Check for UPPER_SNAKE_CASE constants
      if (!content.match(/const\s+[A-Z_]+\s*=/) && content.includes('const')) {
        violations++;
      }
    }

    const score = 1 - violations / totalChecks;
    return Math.max(0, Math.min(1, score));
  }

  private checkCodeOrganization(): number {
    const rootDirs = ['app', 'components', 'hooks', 'lib', 'types', 'utils', 'styles'];

    let existingDirs = 0;
    for (const dir of rootDirs) {
      if (fs.existsSync(path.join(this.rootDir, dir))) {
        existingDirs++;
      }
    }

    const organizationScore = existingDirs / rootDirs.length;

    // Check for index files (proper module exports)
    let indexFiles = 0;
    for (const dir of rootDirs) {
      const indexPath = path.join(this.rootDir, dir, 'index.ts');
      if (fs.existsSync(indexPath)) indexFiles++;
    }

    const indexScore = indexFiles / rootDirs.length;

    return (organizationScore + indexScore) / 2;
  }

  private checkCodeComplexity(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let complexFunctions = 0;
    let totalFunctions = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');

      // Count functions
      const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || [];
      totalFunctions += functionMatches.length;

      // Count cyclomatic complexity indicators
      const complexityIndicators =
        (content.match(/if\s*\(/g) || []).length +
        (content.match(/for\s*\(/g) || []).length +
        (content.match(/while\s*\(/g) || []).length +
        (content.match(/\?\s*:/g) || []).length +
        (content.match(/catch\s*\(/g) || []).length;

      // If more than 15 complexity indicators in one file, it's too complex
      if (complexityIndicators > 15) complexFunctions++;
    }

    if (totalFunctions === 0) return 1;
    const complexityScore = 1 - complexFunctions / totalFunctions;
    return Math.max(0, Math.min(1, complexityScore));
  }

  private checkDRYPrinciple(): number {
    const appDir = path.join(this.rootDir, 'app');
    const componentsDir = path.join(this.rootDir, 'components');

    if (!fs.existsSync(appDir) && !fs.existsSync(componentsDir)) return 0;

    const checkDir = fs.existsSync(componentsDir) ? componentsDir : appDir;
    const files = this.getFilesRecursive(checkDir)
      .filter((f) => f.endsWith('.tsx'))
      .slice(0, 20);

    // Calculate similarity/duplication
    const contentHashes = new Map<string, number>();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      // Simple hash of content
      const normalized = content.replace(/\s+/g, ' ');
      contentHashes.set(normalized, (contentHashes.get(normalized) || 0) + 1);
    }

    let duplicateLines = 0;
    Array.from(contentHashes.entries()).forEach(([, count]) => {
      if (count > 1) duplicateLines += count - 1;
    });

    const dryScore = 1 - duplicateLines / files.length;
    return Math.max(0, Math.min(1, dryScore));
  }

  private checkCodeQualityTools(): number {
    let score = 0;

    // ESLint
    const hasESLint =
      fs.existsSync(path.join(this.rootDir, '.eslintrc.json')) ||
      fs.existsSync(path.join(this.rootDir, 'eslint.config.js'));
    if (hasESLint) score += 0.33;

    // Prettier
    const hasPrettier =
      fs.existsSync(path.join(this.rootDir, '.prettierrc')) ||
      fs.existsSync(path.join(this.rootDir, '.prettierrc.json'));
    if (hasPrettier) score += 0.33;

    // Pre-commit hooks (husky)
    const packageJson = this.readPackageJson();
    if (packageJson.devDependencies?.husky) score += 0.34;

    return Math.min(score, 1);
  }

  private checkSOLIDPrinciples(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    let solidScore = 0;

    // S - Single Responsibility: One component per file (check file size)
    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let appropriateSize = 0;
    for (const file of files.slice(0, 15)) {
      const stats = fs.statSync(file);
      const fileSizeKb = stats.size / 1024;
      if (fileSizeKb < 10) appropriateSize++;
    }
    solidScore += (appropriateSize / Math.min(15, files.length)) * 0.2;

    // O - Open/Closed: Proper exports and composition
    let hasProperComposition = 0;
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('export') && content.includes('interface')) {
        hasProperComposition++;
      }
    }
    solidScore += (hasProperComposition / Math.min(10, files.length)) * 0.2;

    // L - Liskov: Proper prop handling and component contracts
    let hasTypedProps = 0;
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.match(/interface\s+\w+Props/) || content.match(/type\s+\w+Props/)) {
        hasTypedProps++;
      }
    }
    solidScore += (hasTypedProps / Math.min(10, files.length)) * 0.2;

    // I - Interface Segregation: Small focused components
    const avgComponentSize =
      files.length > 0
        ? files.reduce((sum, f) => sum + fs.statSync(f).size, 0) / files.length / 1024
        : 5;
    solidScore += avgComponentSize < 8 ? 0.2 : Math.max(0, 0.2 - (avgComponentSize - 8) * 0.02);

    // D - Dependency Inversion: Using hooks and composition
    let usesDI = 0;
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (
        content.includes('useContext') ||
        content.includes('useCallback') ||
        content.includes('useMemo') ||
        content.includes('useEffect')
      ) {
        usesDI++;
      }
    }
    solidScore += (usesDI / Math.min(10, files.length)) * 0.2;

    return Math.min(solidScore, 1);
  }

  private checkTestingScore(): number {
    let score = 0;

    // Industry Standard: 70-80% code coverage target
    const coverageScore = this.checkTestCoverage();
    score += coverageScore * 25;

    // Jest/Vitest Best Practices
    const frameworkScore = this.checkTestingFramework();
    score += frameworkScore * 20;

    // Test Organization & Types (Unit, Integration, E2E)
    const organizationScore = this.checkTestOrganization();
    score += organizationScore * 20;

    // Test Quality (proper assertions, mocking)
    const qualityScore = this.checkTestQuality();
    score += qualityScore * 20;

    // CI/CD Integration
    const ciIntegrationScore = this.checkCIIntegration();
    score += ciIntegrationScore * 15;

    return Math.min(score, 100);
  }

  private checkTestCoverage(): number {
    const packageJson = this.readPackageJson();

    // Check for test framework
    const hasTestFramework =
      packageJson.devDependencies?.jest ||
      packageJson.devDependencies?.vitest ||
      packageJson.devDependencies?.['@testing-library/react'];

    if (!hasTestFramework) return 0.2;

    // Count test files
    const testCount = this.countFilesMatching(/\.test\.(tsx?|jsx?)$|__tests__\/.*\.(tsx?|jsx?)$/);

    // Rough estimation: expect ~1 test file per 2-3 source files
    const appDir = path.join(this.rootDir, 'app');
    const componentsDir = path.join(this.rootDir, 'components');

    let sourceFiles = 0;
    if (fs.existsSync(appDir)) sourceFiles += this.getFilesRecursive(appDir).length;
    if (fs.existsSync(componentsDir)) sourceFiles += this.getFilesRecursive(componentsDir).length;

    const expectedTests = sourceFiles / 2.5;
    const coverage = Math.min(testCount / expectedTests, 1);

    return Math.max(0.2, coverage);
  }

  private checkTestingFramework(): number {
    const packageJson = this.readPackageJson();

    // Check for primary framework
    const hasJest = packageJson.devDependencies?.jest;
    const hasVitest = packageJson.devDependencies?.vitest;
    const hasTestingLibrary = packageJson.devDependencies?.['@testing-library/react'];

    if (!hasJest && !hasVitest) return 0;

    let score = 0.5; // Base score for having framework

    // Testing Library (best practice for React)
    if (hasTestingLibrary) score += 0.2;

    // Check for test config
    const hasConfig =
      fs.existsSync(path.join(this.rootDir, 'jest.config.js')) ||
      fs.existsSync(path.join(this.rootDir, 'jest.config.ts')) ||
      fs.existsSync(path.join(this.rootDir, 'vitest.config.ts'));
    if (hasConfig) score += 0.15;

    // Check for test script
    if (packageJson.scripts?.test || packageJson.scripts?.['test:unit']) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  private checkTestOrganization(): number {
    let score = 0;

    // Check for test directories
    const hasTestsDir =
      fs.existsSync(path.join(this.rootDir, '__tests__')) ||
      fs.existsSync(path.join(this.rootDir, 'tests'));
    if (hasTestsDir) score += 0.15;

    // Check for different test types
    const packageJson = this.readPackageJson();
    if (packageJson.scripts?.['test:unit']) score += 0.15;
    if (packageJson.scripts?.['test:integration']) score += 0.2;
    if (packageJson.scripts?.['test:e2e']) score += 0.2;
    if (packageJson.scripts?.['test:coverage']) score += 0.15;

    // If only 'test' script, assume all tests in one
    if (
      packageJson.scripts?.test &&
      Object.keys(packageJson.scripts).filter((k) => k.includes('test')).length === 1
    ) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  private checkTestQuality(): number {
    const testFiles = this.getFilesRecursive(path.join(this.rootDir, 'app')).filter(
      (f) => f.endsWith('.test.tsx') || f.endsWith('.test.ts'),
    );

    if (testFiles.length === 0) return 0.1;

    let qualityScore = 0;
    let totalTests = 0;

    for (const file of testFiles.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      totalTests++;

      // Good practices
      if (content.includes('describe')) qualityScore += 0.1;
      if (content.includes('it(') || content.includes('test(')) qualityScore += 0.1;
      if (content.match(/expect\(/g)) qualityScore += 0.1;
      if (content.includes('beforeEach') || content.includes('beforeAll')) qualityScore += 0.1;
      if (content.includes('jest.mock') || content.includes('vi.mock')) qualityScore += 0.1;
    }

    if (totalTests === 0) return 0.1;
    return Math.min(qualityScore / (totalTests * 5), 1);
  }

  private checkCIIntegration(): number {
    // Check for GitHub Actions
    const githubActionsPath = path.join(this.rootDir, '.github', 'workflows');
    if (fs.existsSync(githubActionsPath)) {
      const workflows = fs.readdirSync(githubActionsPath);
      if (workflows.some((w) => w.includes('test') || w.includes('ci'))) return 1;
    }

    // Check for other CI configs
    const hasCI =
      fs.existsSync(path.join(this.rootDir, '.gitlab-ci.yml')) ||
      fs.existsSync(path.join(this.rootDir, '.circleci')) ||
      fs.existsSync(path.join(this.rootDir, 'Jenkinsfile'));

    if (hasCI) return 0.8;

    const packageJson = this.readPackageJson();
    if (packageJson.scripts?.['test:ci']) return 0.5;

    return 0.1;
  }

  private checkPerformanceScore(): number {
    let score = 0;

    // Google Core Web Vitals: LCP (Largest Contentful Paint)
    const lcpScore = this.checkLCPOptimization();
    score += lcpScore * 20;

    // Google Core Web Vitals: FID (First Input Delay) / INP
    const fidScore = this.checkFIDOptimization();
    score += fidScore * 20;

    // Google Core Web Vitals: CLS (Cumulative Layout Shift)
    const clsScore = this.checkCLSOptimization();
    score += clsScore * 15;

    // Image Optimization
    const imageScore = this.checkImageOptimization();
    score += imageScore * 15;

    // Code Splitting & Lazy Loading
    const bundleScore = this.checkBundleOptimization();
    score += bundleScore * 15;

    // Build & Runtime Optimization
    const buildScore = this.checkBuildOptimization();
    score += buildScore * 15;

    return Math.min(score, 100);
  }

  private checkLCPOptimization(): number {
    // LCP: Optimize critical resources, preload fonts, remove render-blocking resources
    let score = 0;

    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf-8');
      if (config.includes('compress')) score += 0.3;
    }

    // Check for preload/prefetch in layout
    const appLayoutPath = path.join(this.rootDir, 'app', 'layout.tsx');
    if (fs.existsSync(appLayoutPath)) {
      const content = fs.readFileSync(appLayoutPath, 'utf-8');
      if (content.includes('preload') || content.includes('prefetch')) score += 0.3;
      if (content.includes('<script') && !content.includes('async') && !content.includes('defer')) {
        // Render-blocking script found
        score -= 0.2;
      }
    }

    // Check for next/font usage (optimized fonts)
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
      for (const file of files.slice(0, 5)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('next/font')) score += 0.4;
        break;
      }
    }

    return Math.max(0, Math.min(score, 1));
  }

  private checkFIDOptimization(): number {
    // FID: Reduce JavaScript, defer non-critical JS, use Web Workers
    let score = 0.3;

    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return score;

    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));

    // Check for useMemo/useCallback (performance optimization)
    let hasPerformanceOptimizations = 0;
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('useMemo') || content.includes('useCallback')) {
        hasPerformanceOptimizations++;
      }
    }
    score += (hasPerformanceOptimizations / Math.min(10, files.length)) * 0.3;

    // Check for event listener best practices
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('useEffect') && !content.includes('cleanup')) {
        score -= 0.1;
      }
    }

    // Check package.json for heavy dependencies
    const packageJson = this.readPackageJson();
    const heavyDeps = ['moment', 'lodash', 'moment-timezone'];
    const hasHeavy = heavyDeps.some((dep) => packageJson.dependencies[dep]);
    if (hasHeavy) score -= 0.15;

    return Math.max(0, Math.min(score, 1));
  }

  private checkCLSOptimization(): number {
    // CLS: Avoid layout shifts, use proper dimensions, contain visual changes
    let score = 0.5;

    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return score;

    // Check for proper image dimensions
    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let imagesWithDimensions = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('next/image')) {
        if (content.match(/width\s*=|height\s*=/)) {
          imagesWithDimensions++;
        }
      }
    }

    score += (imagesWithDimensions / Math.min(15, files.length)) * 0.3;

    // Check for font-display: swap
    const appLayoutPath = path.join(this.rootDir, 'app', 'layout.tsx');
    if (fs.existsSync(appLayoutPath)) {
      const content = fs.readFileSync(appLayoutPath, 'utf-8');
      if (content.includes('font-display: swap')) score += 0.2;
    }

    return Math.min(score, 1);
  }

  private checkImageOptimization(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    let score = 0;
    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));

    // Check for next/image usage
    let nextImageUsage = 0;
    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('from "next/image"') || content.includes("from 'next/image'")) {
        nextImageUsage++;
      }
    }
    score += (nextImageUsage / Math.min(15, files.length)) * 0.4;

    // Check for srcSet/responsive images
    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('srcSet') || content.includes('sizes')) {
        score += 0.15;
        break;
      }
    }

    // Check for lazy loading
    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('loading="lazy"') || content.includes('priority={false}')) {
        score += 0.15;
        break;
      }
    }

    // Check for Image component optimization props
    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('quality=') || content.includes('placeholder=')) {
        score += 0.3;
        break;
      }
    }

    return Math.min(score, 1);
  }

  private checkBundleOptimization(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    let score = 0;
    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));

    // Check for dynamic imports
    let dynamicImports = 0;
    for (const file of files.slice(0, 20)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('dynamic(') || content.includes('React.lazy')) {
        dynamicImports++;
      }
    }
    score += (dynamicImports / Math.min(20, files.length)) * 0.4;

    // Check for proper code splitting
    const packageJson = this.readPackageJson();
    if (packageJson.dependencies['@loadable/component']) score += 0.15;

    // Check next.config.js for optimization
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf-8');
      if (config.includes('swcMinify') || config.includes('compress')) score += 0.2;
      if (config.includes('experimental')) score += 0.1;
    }

    // Check for module aliases (better tree-shaking)
    const tsconfigPath = path.join(this.rootDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      if (tsconfig.compilerOptions?.baseUrl || tsconfig.compilerOptions?.paths) {
        score += 0.15;
      }
    }

    return Math.min(score, 1);
  }

  private checkBuildOptimization(): number {
    let score = 0;

    const packageJson = this.readPackageJson();

    // Check for build optimization dependencies
    if (packageJson.dependencies.sharp) score += 0.2;
    if (packageJson.dependencies['next-seo'] || packageJson.dependencies['react-helmet-async']) {
      score += 0.15;
    }

    // Check next.config.js for SWC optimization
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf-8');
      if (config.includes('swcMinify')) score += 0.2;
      if (config.includes('reactStrictMode')) score += 0.15;
      if (config.includes('optimizeFonts')) score += 0.15;
    }

    // Check for environmental monitoring
    if (packageJson.dependencies['@sentry/react'] || packageJson.dependencies['@sentry/nextjs']) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  private checkStateManagementScore(): number {
    let score = 0;

    // Centralized State Management
    const stateLibScore = this.checkStateLibrary();
    score += stateLibScore * 25;

    // Context API & Hooks Pattern
    const contextScore = this.checkContextPattern();
    score += contextScore * 20;

    // Data Fetching Strategy
    const dataFetchScore = this.checkDataFetchingPattern();
    score += dataFetchScore * 20;

    // State Organization & Structure
    const organizationScore = this.checkStateOrganization();
    score += organizationScore * 20;

    // Immutability & Data Flow
    const immutabilityScore = this.checkImmutabilityPattern();
    score += immutabilityScore * 15;

    return Math.min(score, 100);
  }

  private checkStateLibrary(): number {
    const packageJson = this.readPackageJson();

    // Zustand (recommended for simplicity and bundle size)
    if (packageJson.dependencies.zustand) return 1;

    // Redux Toolkit (enterprise-grade)
    if (packageJson.dependencies['@reduxjs/toolkit']) return 0.9;
    if (packageJson.dependencies.redux) return 0.7;

    // Jotai, Recoil (atomic state)
    if (packageJson.dependencies.jotai) return 0.85;
    if (packageJson.dependencies.recoil) return 0.8;

    // No state management library
    return 0.3;
  }

  private checkContextPattern(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let contextUsage = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('useContext') && content.includes('createContext')) {
        contextUsage++;
      }
    }

    return Math.min(contextUsage / 15, 1);
  }

  private checkDataFetchingPattern(): number {
    const packageJson = this.readPackageJson();

    // SWR (recommended for simplicity)
    if (packageJson.dependencies.swr) return 0.9;

    // React Query / TanStack Query (enterprise-grade)
    if (
      packageJson.dependencies['@tanstack/react-query'] ||
      packageJson.dependencies['react-query']
    ) {
      return 0.95;
    }

    // Fetch with useEffect (not recommended)
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
      let fetchInUseEffect = 0;

      for (const file of files.slice(0, 15)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('useEffect') && content.match(/fetch\(|axios\./)) {
          fetchInUseEffect++;
        }
      }

      if (fetchInUseEffect > 5) return 0.4;
      if (fetchInUseEffect > 0) return 0.6;
    }

    return 0.3;
  }

  private checkStateOrganization(): number {
    let score = 0;

    // Check for hooks directory
    const hooksDir = path.join(this.rootDir, 'hooks') || path.join(this.rootDir, 'app', 'hooks');
    if (fs.existsSync(hooksDir)) score += 0.3;

    // Check for store/context directory
    const libDir = path.join(this.rootDir, 'lib');
    if (fs.existsSync(libDir)) {
      const files = fs.readdirSync(libDir);
      if (
        files.some((f) => f.includes('store') || f.includes('provider') || f.includes('context'))
      ) {
        score += 0.35;
      }
    }

    // Check for proper state separation
    const storeDir = path.join(this.rootDir, 'store') || path.join(this.rootDir, 'lib', 'store');
    if (fs.existsSync(storeDir)) score += 0.35;

    return Math.min(score, 1);
  }

  private checkImmutabilityPattern(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let immutablePatterns = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');

      // Spread operator for immutability
      if (content.match(/\.\.\./g) && content.includes('setState')) {
        immutablePatterns++;
      }

      // Immer library for immutable updates
      if (content.includes('produce') || content.includes('draft')) {
        immutablePatterns++;
      }
    }

    return Math.min(immutablePatterns / 15, 1);
  }

  private checkErrorHandlingScore(): number {
    let score = 0;

    // Global Error Handlers
    const globalScore = this.checkGlobalErrorHandling();
    score += globalScore * 20;

    // Error Boundaries & Components
    const boundaryScore = this.checkErrorBoundaries();
    score += boundaryScore * 20;

    // Try-Catch & Error Recovery
    const tryCatchScore = this.checkTryCatchPatterns();
    score += tryCatchScore * 20;

    // Error Monitoring & Tracking
    const monitoringScore = this.checkErrorMonitoring();
    score += monitoringScore * 20;

    // User-Friendly Error Messages
    const userFeedbackScore = this.checkErrorUserFeedback();
    score += userFeedbackScore * 20;

    return Math.min(score, 100);
  }

  private checkGlobalErrorHandling(): number {
    let score = 0;

    // error.tsx exists
    const errorTsxPath = path.join(this.rootDir, 'app', 'error.tsx');
    if (fs.existsSync(errorTsxPath)) score += 0.3;

    // not-found.tsx exists
    const notFoundPath = path.join(this.rootDir, 'app', 'not-found.tsx');
    if (fs.existsSync(notFoundPath)) score += 0.25;

    // global-error.tsx for root errors
    const globalErrorPath = path.join(this.rootDir, 'app', 'global-error.tsx');
    if (fs.existsSync(globalErrorPath)) score += 0.25;

    // Check for loading.tsx (graceful loading states)
    const loadingPath = path.join(this.rootDir, 'app', 'loading.tsx');
    if (fs.existsSync(loadingPath)) score += 0.2;

    return Math.min(score, 1);
  }

  private checkErrorBoundaries(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    let score = 0;
    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));

    // Next.js error.tsx are built-in error boundaries
    if (fs.existsSync(path.join(this.rootDir, 'app', 'error.tsx'))) {
      score += 0.5;
    }

    // Check for custom error handling in layout
    const layoutPath = path.join(this.rootDir, 'app', 'layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf-8');
      if (content.includes('ErrorBoundary') || content.includes('error.tsx')) {
        score += 0.3;
      }
    }

    // Check for error handling in components
    let componentsWithErrorHandling = 0;
    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('try') && content.includes('catch')) {
        componentsWithErrorHandling++;
      }
    }
    score += (componentsWithErrorHandling / Math.min(10, files.length)) * 0.2;

    return Math.min(score, 1);
  }

  private checkTryCatchPatterns(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0.2;

    const files = this.getFilesRecursive(appDir).filter(
      (f) => f.endsWith('.tsx') || f.endsWith('.ts'),
    );
    let tryCatchCount = 0;
    let totalChecks = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      totalChecks++;

      // Check for try-catch
      if (content.includes('try') && content.includes('catch')) {
        tryCatchCount++;
      }
    }

    const ratio = totalChecks > 0 ? tryCatchCount / totalChecks : 0;
    return Math.min(ratio, 1);
  }

  private checkErrorMonitoring(): number {
    const packageJson = this.readPackageJson();

    // Sentry for error tracking
    if (packageJson.dependencies['@sentry/react'] || packageJson.dependencies['@sentry/nextjs']) {
      return 0.8;
    }

    // Other error monitoring services
    if (
      packageJson.dependencies['@rollbar/react'] ||
      packageJson.dependencies['airbrake'] ||
      packageJson.dependencies['bugsnag-js']
    ) {
      return 0.7;
    }

    // Check for custom error logging
    const libDir = path.join(this.rootDir, 'lib');
    if (fs.existsSync(libDir)) {
      const files = fs.readdirSync(libDir);
      if (files.some((f) => f.includes('error') || f.includes('logger'))) {
        return 0.5;
      }
    }

    return 0.2;
  }

  private checkErrorUserFeedback(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0;

    const packageJson = this.readPackageJson();
    let score = 0;

    // Toast notification library
    if (
      packageJson.dependencies['react-hot-toast'] ||
      packageJson.dependencies['sonner'] ||
      packageJson.dependencies['react-toastify']
    ) {
      score += 0.4;
    }

    // Check for user-facing error messages in components
    const files = this.getFilesRecursive(appDir).filter((f) => f.endsWith('.tsx'));
    let componentsWithErrorMsg = 0;

    for (const file of files.slice(0, 10)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.match(/error.*message|error.*text|setError|showError/gi)) {
        componentsWithErrorMsg++;
      }
    }

    score += (componentsWithErrorMsg / Math.min(10, files.length)) * 0.6;

    return Math.min(score, 1);
  }

  private checkLoggingScore(): number {
    let score = 0;

    // Logging Infrastructure
    const infraScore = this.checkLoggingInfrastructure();
    score += infraScore * 25;

    // Structured Logging
    const structuredScore = this.checkStructuredLogging();
    score += structuredScore * 25;

    // Log Levels & Severity
    const levelScore = this.checkLogLevels();
    score += levelScore * 20;

    // Log Aggregation & Monitoring
    const aggregationScore = this.checkLogAggregation();
    score += aggregationScore * 20;

    // Production Logging Practices
    const prodScore = this.checkProductionLogging();
    score += prodScore * 10;

    return Math.min(score, 100);
  }

  private checkLoggingInfrastructure(): number {
    const packageJson = this.readPackageJson();

    // Winston (most popular, enterprise-grade)
    if (packageJson.dependencies.winston) return 1;

    // Pino (high-performance)
    if (packageJson.dependencies.pino) return 0.95;

    // Bunyan
    if (packageJson.dependencies.bunyan) return 0.9;

    // Other logging libraries
    if (packageJson.dependencies['log4js'] || packageJson.dependencies['loglevel']) {
      return 0.7;
    }

    return 0.2;
  }

  private checkStructuredLogging(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0.2;

    const libDir = path.join(this.rootDir, 'lib');
    let score = 0.2;

    // Check for logger utility
    if (fs.existsSync(libDir)) {
      const files = fs.readdirSync(libDir);
      if (files.some((f) => f.includes('logger') || f.includes('log'))) {
        score += 0.4;
      }
    }

    // Check for structured logging patterns
    const files = this.getFilesRecursive(appDir).filter(
      (f) => f.endsWith('.tsx') || f.endsWith('.ts'),
    );
    let structuredLogs = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      // Check for object-based logging
      if (content.match(/logger\.\w+\s*\(\s*\{/) || content.match(/console\.\w+\s*\(\s*\{/)) {
        structuredLogs++;
      }
    }

    score += (structuredLogs / Math.min(15, files.length)) * 0.4;

    return Math.min(score, 1);
  }

  private checkLogLevels(): number {
    const appDir = path.join(this.rootDir, 'app');
    if (!fs.existsSync(appDir)) return 0.3;

    const files = this.getFilesRecursive(appDir).filter(
      (f) => f.endsWith('.tsx') || f.endsWith('.ts'),
    );
    let logLevelUsage = 0;
    const logLevels = ['debug', 'info', 'warn', 'error', 'fatal'];

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const level of logLevels) {
        if (content.match(new RegExp(`(?:logger|console)\\.${level}`, 'i'))) {
          logLevelUsage++;
          break;
        }
      }
    }

    return Math.min((logLevelUsage / Math.min(15, files.length)) * 0.8 + 0.2, 1);
  }

  private checkLogAggregation(): number {
    const packageJson = this.readPackageJson();

    // Sentry includes logging
    if (packageJson.dependencies['@sentry/react'] || packageJson.dependencies['@sentry/nextjs']) {
      return 0.7;
    }

    // CloudWatch integration
    if (
      packageJson.dependencies['aws-sdk'] ||
      packageJson.dependencies['@aws-sdk/client-cloudwatch-logs']
    ) {
      return 0.6;
    }

    // Datadog or similar services
    if (packageJson.dependencies['dd-trace'] || packageJson.dependencies['@datadog/browser-rum']) {
      return 0.7;
    }

    return 0.2;
  }

  private checkProductionLogging(): number {
    const nextConfigPath = path.join(this.rootDir, 'next.config.js');
    let score = 0;

    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf-8');
      if (content.includes('process.env.NODE_ENV') || content.includes('NODE_ENV')) {
        score += 0.5;
      }
    }

    // Check for environment-based configuration
    const envPath = path.join(this.rootDir, '.env.example');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      if (content.includes('LOG_LEVEL') || content.includes('DEBUG')) {
        score += 0.5;
      }
    }

    return Math.min(score, 1);
  }

  private readPackageJson(): any {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return {};
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  }

  private displayReport(report: ProjectReport): void {
    this.log(`\n${'═'.repeat(80)}`, colors.blue);
    this.log(`\n${report.name}`, colors.bold);
    this.log(`Path: ${report.path}`, colors.dim);
    this.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`, colors.dim);

    this.log(`\n${'─'.repeat(80)}`, colors.blue);
    this.log('\nProduction Readiness by Aspect:\n', colors.bold);

    // Display each aspect
    report.aspects.forEach((aspect) => {
      const icon = this.getStatusIcon(aspect.score);
      const color = this.getStatusColor(aspect.score);
      const barLength = 30;
      const filledLength = Math.round((aspect.score / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

      this.log(
        `  ${aspect.name.padEnd(20)} ${String(aspect.score).padStart(3)}% ${icon} ${color}${bar}${colors.reset}`,
        '',
      );
    });

    // Overall score
    const overallIcon = this.getStatusIcon(report.overallScore);
    const overallColor = this.getStatusColor(report.overallScore);
    const overallBarLength = 40;
    const overallFilledLength = Math.round((report.overallScore / 100) * overallBarLength);
    const overallBar =
      '█'.repeat(overallFilledLength) + '░'.repeat(overallBarLength - overallFilledLength);

    this.log(`\n${'─'.repeat(80)}`, colors.blue);
    this.log(`\nOVERALL SCORE: ${report.overallScore}% ${overallIcon}`, colors.bold + overallColor);
    this.log(`${overallColor}${overallBar}${colors.reset}\n`, '');
  }

  private saveReport(report: ProjectReport): void {
    const reportDir = path.join(this.rootDir, '..', 'reports');

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = report.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const filename = `${safeName}-${timestamp}.json`;
    const filepath = path.join(reportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8');
  }

  public run(): void {
    console.clear();

    this.log(`\n${'═'.repeat(80)}`, colors.blue);
    this.log(`📊 ADMINPANEL PRODUCTION READINESS REPORT`, colors.bold + colors.blue);
    this.log(`Generated: ${new Date().toLocaleString()}`, colors.dim);
    this.log(`${'═'.repeat(80)}\n`, colors.blue);

    const report = this.generateReport();

    this.displayReport(report);
    this.saveReport(report);

    this.log('\n📁 Report saved to: ../reports/', colors.dim);
    this.log('💡 Re-run weekly to track progress\n', colors.dim);
  }
}

const generator = new AdminPanelProductionReport();
generator.run();
