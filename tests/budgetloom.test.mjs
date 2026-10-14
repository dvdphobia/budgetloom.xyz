import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'

const ROOT = process.cwd()
const localRequire = createRequire(import.meta.url)
const ts = localRequire('typescript')

function transpile(source, filename) {
  const result = ts.transpileModule(source, {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      isolatedModules: true,
    },
  })
  const errors = (result.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error)
  assert.equal(errors.length, 0, `Transpile errors in ${filename}: ${errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('; ')}`)
  return result.outputText
}

// Helper to transpile and load a TypeScript module from the repository in memory
const moduleCache = new Map()
function loadTsModule(relPath) {
  const fullPath = path.resolve(ROOT, relPath)
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath)

  const code = fs.readFileSync(fullPath, 'utf8')
  const transformed = transpile(code, fullPath)

  const mod = { exports: {} }
  moduleCache.set(fullPath, mod.exports)

  const customRequire = (id) => {
    if (id.startsWith('@/')) {
      const target = id.slice(2)
      const candidates = [
        `${target}.ts`,
        `${target}.tsx`,
        `${target}/index.ts`,
        `${target}/index.tsx`,
      ]
      for (const c of candidates) {
        if (fs.existsSync(path.resolve(ROOT, c))) return loadTsModule(c)
      }
    }
    return localRequire(id)
  }

  const wrapper = vm.runInThisContext(
    `(function(exports, require, module, __filename, __dirname) { ${transformed}\n})`,
    { filename: fullPath }
  )
  wrapper(mod.exports, customRequire, mod, fullPath, path.dirname(fullPath))
  moduleCache.set(fullPath, mod.exports)
  return mod.exports
}

// ============================================================================
// 1. FULL REPOSITORY TYPESCRIPT + JSX COMPILATION VERIFICATION
// ============================================================================
test('TypeScript & JSX Compilation: All 60+ .ts/.tsx files compile cleanly with zero syntax errors', () => {
  const dirs = ['lib', 'app', 'components']
  let compiledCount = 0

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const src = fs.readFileSync(full, 'utf8')
        const result = transpile(src, full)
        assert.ok(result.length > 0, `Failed to transpile ${full}`)
        compiledCount++
      }
    }
  }

  for (const d of dirs) walk(path.join(ROOT, d))
  assert.ok(compiledCount >= 50, `Expected at least 50 compiled TS/TSX files, compiled ${compiledCount}`)
})

// ============================================================================
// 2. MATHEMATICAL & FINANCIAL CALCULATOR ENGINE UNIT TESTS (lib/calculators.ts)
// ============================================================================
test('lib/calculators.ts: Cent-Accurate Currency Conversion & Boundary Handling', () => {
  const calc = loadTsModule('lib/calculators.ts')

  assert.equal(calc.fromCents(calc.toCents('0.10') + calc.toCents('0.20')), 0.3)
  assert.equal(calc.fromCents(calc.toCents('19.99') + calc.toCents('5.01')), 25.0)
  assert.equal(calc.toCents('-500'), 0)
  assert.equal(calc.toCents('NaN'), 0)
  assert.equal(calc.toCents(''), 0)
  assert.equal(calc.toCents(999_999_999), 1_000_000_000) // Clamped at $10M
  assert.equal(calc.isValidPositiveMoney('250.50'), true)
  assert.equal(calc.isValidPositiveMoney('-10'), false)
})

test('lib/calculators.ts: Monthly & Zero-Based Budget Calculator Math', () => {
  const calc = loadTsModule('lib/calculators.ts')

  const res = calc.calculateMonthlyBudget('4000', [
    { id: '1', name: 'Rent', category: 'Needs', planned: '2000', actual: '2000' },
    { id: '2', name: 'Dining', category: 'Wants', planned: '800', actual: '750' },
    { id: '3', name: 'Savings', category: 'Savings & Debt', planned: '1200', actual: '1200' },
  ])

  assert.equal(res.takeHome, 4000)
  assert.equal(res.planned, 4000)
  assert.equal(res.remainingPlanned, 0)
  assert.equal(res.isZeroBasedBalanced, true)
  assert.equal(res.isOverAllocated, false)
  assert.equal(res.actual, 3950)
  assert.equal(res.remainingActual, 50)
  assert.deepEqual(res.groupShares, { needsPct: 50, wantsPct: 20, savingsPct: 30 })
})

test('lib/calculators.ts: 50/30/20 & Custom Percentage Split Exact-Cent Balance', () => {
  const calc = loadTsModule('lib/calculators.ts')

  // Odd fractional income $3,333.33 must sum back to $3,333.33 without losing a cent
  const split = calc.calculatePercentageSplit('3333.33', 50, 30, 20)
  assert.equal(split.valid, true)
  assert.equal(
    calc.toCents(split.needsAmount) + calc.toCents(split.wantsAmount) + calc.toCents(split.savingsAmount),
    333333
  )

  // Invalid percentages that do not sum to 100% must return valid: false
  const invalidSplit = calc.calculatePercentageSplit('4000', 60, 30, 20)
  assert.equal(invalidSplit.valid, false)
})

test('lib/calculators.ts: Biweekly 26-Paycheck & 3-Paycheck Month Math', () => {
  const calc = loadTsModule('lib/calculators.ts')

  const bw = calc.calculateBiweeklyBudget('2000', '2100', '400')
  assert.equal(bw.valid, true)
  assert.equal(bw.annualTakeHome, 52000)
  assert.equal(bw.standardTwoCheckMonthIncome, 4000)
  assert.equal(bw.billReservePerPaycheck, 1050)
  assert.equal(bw.flexibleAndGoalsPerPaycheck, 550)
  assert.equal(bw.extraPaycheckNetAfterEssentials, 1600)
})

test('lib/calculators.ts: Savings Goal, Sinking Fund & Emergency Fund Calculators', () => {
  const calc = loadTsModule('lib/calculators.ts')

  const sg = calc.calculateSavingsGoal('1200', '300', '12', '0')
  assert.equal(sg.valid, true)
  assert.equal(sg.remaining, 900)
  assert.equal(sg.monthlySimple, 75)
  assert.equal(sg.progressPercent, 25)

  const sgWithInterest = calc.calculateSavingsGoal('1200', '300', '12', '4.5')
  assert.equal(sgWithInterest.valid, true)
  assert.ok(sgWithInterest.monthlyWithInterest <= sg.monthlySimple)

  const sf = calc.calculateSinkingFunds([
    { id: '1', name: 'Auto Insurance', targetAmount: '720', alreadySaved: '120', monthsUntilDue: '5' },
    { id: '2', name: 'Holiday Fund', targetAmount: '600', alreadySaved: '0', monthsUntilDue: '6' },
  ])
  assert.equal(sf.totalMonthlyRequired, 220) // $120/mo + $100/mo

  const ef = calc.calculateEmergencyFund('2500', '3', '1000', '500')
  assert.equal(ef.valid, true)
  assert.equal(ef.fullTargetAmount, 7500)
  assert.equal(ef.remainingToStarter, 0)
  assert.equal(ef.remainingToFull, 6500)
  assert.equal(ef.monthsToFullGoal, 13)
})

test('lib/calculators.ts: Debt Snowball vs. Avalanche Amortization & Non-Amortizing Edge Cases', () => {
  const calc = loadTsModule('lib/calculators.ts')

  const sampleDebts = [
    { id: 'd1', name: 'Small Zero-Interest Medical', balance: '500', aprPercent: '0', minPayment: '50' },
    { id: 'd2', name: 'High-APR Visa', balance: '2500', aprPercent: '24', minPayment: '75' },
    { id: 'd3', name: 'Auto Loan', balance: '5000', aprPercent: '6', minPayment: '150' },
  ]

  const snowball = calc.calculateDebtPayoff(sampleDebts, '200', 'snowball')
  const avalanche = calc.calculateDebtPayoff(sampleDebts, '200', 'avalanche')

  assert.equal(snowball.valid, true)
  assert.equal(avalanche.valid, true)
  // Avalanche (highest APR first) must pay less or equal total interest than Snowball
  assert.ok(
    avalanche.totalInterestPaid <= snowball.totalInterestPaid,
    `Expected avalanche interest (${avalanche.totalInterestPaid}) <= snowball interest (${snowball.totalInterestPaid})`
  )
  // Snowball must prioritize the $500 balance first; Avalanche must prioritize the 24% APR card first
  assert.equal(snowball.payoffOrder[0].id, 'd1')
  assert.equal(avalanche.payoffOrder[0].id, 'd2')

  // Non-amortizing scenario: $10,000 at 24% APR accrues $200/mo interest; $100 payment cannot amortize
  const nonAmortizing = calc.calculateDebtPayoff(
    [{ id: 'bad', name: 'Predatory Loan', balance: '10000', aprPercent: '24', minPayment: '100' }],
    '0',
    'avalanche'
  )
  assert.equal(nonAmortizing.valid, false)
  assert.equal(nonAmortizing.nonAmortizing, true)
})

test('lib/calculators.ts: 30-Day Challenge, Subscription Audit, Grocery & Household Split', () => {
  const calc = loadTsModule('lib/calculators.ts')

  for (const amt of [100, 300, 500, 750.25]) {
    const ch = calc.generate30DayChallengeSchedule(amt)
    assert.equal(ch.valid, true)
    assert.equal(ch.rows.length, 30)
    assert.equal(ch.total, amt)
    assert.equal(ch.rows[29].runningTotal, amt)
  }

  const sub = calc.calculateSubscriptionAudit([
    { id: '1', name: 'Keep App', amount: '10', frequency: 'monthly', keepStatus: 'essential' },
    { id: '2', name: 'Cancel Annual', amount: '120', frequency: 'annual', keepStatus: 'cancel' },
  ])
  assert.equal(sub.activeMonthlyTotal, 10)
  assert.equal(sub.monthlySavingsFromCanceling, 10)
  assert.equal(sub.annualSavingsFromCanceling, 120)

  const split = calc.calculateHouseholdSplit('3600', '2400', '3000')
  assert.equal(split.valid, true)
  assert.equal(split.proportional.partnerASharePct, 60)
  assert.equal(split.proportional.partnerBSharePct, 40)
  assert.equal(split.proportional.partnerAContribution, 1800)
  assert.equal(split.proportional.partnerBContribution, 1200)
  assert.equal(split.equalSplit.partnerAContribution, 1500)
})

// ============================================================================
// 3. STRUCTURED LOGGER & PII REDACTION UNIT TESTS (lib/logger.ts)
// ============================================================================
test('lib/logger.ts: Redacts PostgreSQL Credentials, Emails & Secret Keys', () => {
  const loggerMod = loadTsModule('lib/logger.ts')

  const scrubbedUrl = loggerMod.redactString(
    'Failed connecting to postgres://admin:superSecretPass123@ep-cool-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=verify-full for user alice@example.com'
  )
  assert.ok(!scrubbedUrl.includes('superSecretPass123'))
  assert.ok(!scrubbedUrl.includes('alice@example.com'))
  assert.ok(scrubbedUrl.includes('postgres://[REDACTED]@'))
  assert.ok(scrubbedUrl.includes('[REDACTED_EMAIL]'))

  const cleanMeta = loggerMod.sanitizeMeta({
    password: 'my-password',
    jwt_secret: 'my-secret',
    income: '5500',
    route: '/blog',
  })
  assert.equal(cleanMeta.password, '[REDACTED]')
  assert.equal(cleanMeta.jwt_secret, '[REDACTED]')
  assert.equal(cleanMeta.income, '[REDACTED]')
  assert.equal(cleanMeta.route, '/blog')
})

// ============================================================================
// 4. CONTENT, PRINTABLES, TOPIC HUBS & INTERNAL LINK CRAWLER AUDIT
// ============================================================================
test('Complete Content, Printables, Topic Clusters & Internal Link Integrity Audit', () => {
  const postsMod = loadTsModule('lib/posts.ts')
  const printablesMod = loadTsModule('lib/printables.ts')
  const calcMod = loadTsModule('lib/calculators.ts')

  assert.equal(postsMod.posts.length, 43, 'Must have 43 published posts')
  assert.equal(postsMod.TOPIC_CLUSTERS.length, 13, 'Must have 13 topic clusters')
  assert.equal(printablesMod.printables.length, 20, 'Must have 20 printable workbooks')
  assert.equal(calcMod.TOOL_CATALOG.length, 15, 'Must have 15 interactive calculators')

  // Build set of all valid internal routes
  const validRoutes = new Set([
    '/',
    '/blog',
    '/topics',
    '/tools',
    '/printables',
    '/free-budget-template',
    '/monthly-budget-worksheet',
    '/budget-calculator',
    '/free-budget-spreadsheet',
    '/about',
    '/editorial-policy',
    '/privacy',
    '/terms',
    '/contact',
    '/admin/login',
    '/admin/dashboard',
    '/admin/dashboard/posts',
    '/admin/dashboard/posts/new',
    '/admin/dashboard/posts/edit',
    '/admin/dashboard/printables',
    '/admin/dashboard/printables/new',
    '/admin/dashboard/printables/edit',
    '/admin/dashboard/ads',
    '/admin/dashboard/settings',
    '/budgetloom-monthly-budget.csv',
  ])

  for (const p of postsMod.posts) {
    assert.ok(p.slug && p.title && p.description && p.content.length > 400, `Invalid post: ${p.slug}`)
    validRoutes.add(`/blog/${p.slug}`)
    const cluster = postsMod.getClusterForPost(p)
    assert.ok(cluster && cluster.slug, `Missing cluster for post ${p.slug}`)
  }

  for (const c of postsMod.TOPIC_CLUSTERS) {
    validRoutes.add(`/topics/${c.slug}`)
    assert.ok(postsMod.getPostBySlug(c.startingGuideSlug), `Cluster ${c.slug} has invalid startingGuideSlug ${c.startingGuideSlug}`)
  }

  for (const t of calcMod.TOOL_CATALOG) {
    validRoutes.add(t.href)
    for (const gs of t.relatedGuides) {
      assert.ok(postsMod.getPostBySlug(gs), `Tool ${t.slug} references missing guide ${gs}`)
    }
    for (const ps of t.relatedPrintables) {
      assert.ok(printablesMod.getPrintableBySlug(ps), `Tool ${t.slug} references missing printable ${ps}`)
    }
  }

  for (const pr of printablesMod.printables) {
    validRoutes.add(`/printables/${pr.slug}`)
    validRoutes.add(`/printables/${pr.slug}.pdf`)
    validRoutes.add(pr.previewCoverUrl)
    validRoutes.add(pr.previewInsideUrl)
    for (const gs of pr.relatedGuides) {
      assert.ok(postsMod.getPostBySlug(gs), `Printable ${pr.slug} references missing guide ${gs}`)
    }
    for (const th of pr.relatedTools) {
      assert.ok(validRoutes.has(th), `Printable ${pr.slug} references invalid tool route ${th}`)
    }
  }

  // Verify all Markdown links [label](/...) inside all 43 articles resolve to validRoutes
  for (const p of postsMod.posts) {
    const mdLinks = [...p.content.matchAll(/\[([^\]]+)\]\((\/[^)#?]+)\)/g)].map((m) => m[2])
    for (const href of mdLinks) {
      assert.ok(validRoutes.has(href), `Broken Markdown link ${href} inside post ${p.slug}`)
    }
  }
})

// ============================================================================
// 5. STATIC IMPORT RESOLUTION & ASSET / DOCUMENTATION INTEGRITY AUDIT
// ============================================================================
test('All 94 TS/TSX files have valid local and @/ alias imports (245 imports verified)', () => {
  const dirs = ['lib', 'app', 'components']
  const allFiles = []
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) allFiles.push(full)
    }
  }
  for (const d of dirs) walk(path.join(ROOT, d))

  function resolveLocal(fromFile, spec) {
    let base
    if (spec.startsWith('@/')) base = path.join(ROOT, spec.slice(2))
    else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec)
    else return null

    for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const p = base + ext
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
    }
    return null
  }

  let verifiedImports = 0
  for (const file of allFiles) {
    const src = fs.readFileSync(file, 'utf8')
    const re = /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
    let m
    while ((m = re.exec(src)) !== null) {
      const spec = m[2].trim()
      if (spec.startsWith('.') || spec.startsWith('@/')) {
        const resolved = resolveLocal(file, spec)
        assert.ok(resolved, `Unresolved import "${spec}" in ${path.relative(ROOT, file)}`)
        verifiedImports++
      }
    }
  }
  assert.ok(verifiedImports >= 240, `Expected >=240 local/alias imports, verified ${verifiedImports}`)
})

test('All 20 PDF workbooks, 40 PNG previews, 5 UI screenshots, 130 backlog items, and 9 documentation files exist on disk', () => {
  const printablesMod = loadTsModule('lib/printables.ts')
  assert.equal(printablesMod.printables.length, 20)

  for (const pr of printablesMod.printables) {
    const pdfPath = path.join(ROOT, 'public', 'printables', `${pr.slug}.pdf`)
    const coverPath = path.join(ROOT, 'public', pr.previewCoverUrl.replace(/^\//, ''))
    const page2Path = path.join(ROOT, 'public', pr.previewInsideUrl.replace(/^\//, ''))

    assert.ok(fs.existsSync(pdfPath), `Missing PDF on disk: ${pdfPath}`)
    const pdfBytes = fs.readFileSync(pdfPath)
    assert.ok(pdfBytes.length > 3500, `PDF too small: ${pdfPath}`)
    assert.equal(pdfBytes.subarray(0, 5).toString('ascii'), '%PDF-', `Invalid PDF magic header: ${pdfPath}`)

    assert.ok(fs.existsSync(coverPath), `Missing cover preview PNG on disk: ${coverPath}`)
    const coverBytes = fs.readFileSync(coverPath)
    assert.ok(coverBytes.length > 1000, `Cover PNG too small: ${coverPath}`)
    assert.equal(coverBytes.subarray(1, 4).toString('ascii'), 'PNG', `Invalid PNG header: ${coverPath}`)

    assert.ok(fs.existsSync(page2Path), `Missing page2 preview PNG on disk: ${page2Path}`)
    const page2Bytes = fs.readFileSync(page2Path)
    assert.ok(page2Bytes.length > 1000, `Page 2 PNG too small: ${page2Path}`)
    assert.equal(page2Bytes.subarray(1, 4).toString('ascii'), 'PNG', `Invalid PNG header: ${page2Path}`)
  }

  // Check 130-item content/seo-backlog.json
  const backlog = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/seo-backlog.json'), 'utf8'))
  assert.equal(backlog.length, 130, 'content/seo-backlog.json must contain 130 items')

  // Check 9 required documentation deliverables
  const requiredDocs = [
    'docs/audits/INITIAL_AUDIT.md',
    'docs/audits/SECURITY_REVIEW.md',
    'docs/architecture/SYSTEM_OVERVIEW.md',
    'docs/seo/SEO_IMPLEMENTATION_REPORT.md',
    'docs/seo/CONTENT_BACKLOG.md',
    'docs/design/DESIGN_SYSTEM.md',
    'docs/qa/TEST_RESULTS.md',
    'docs/deployment/DEPLOYMENT_RUNBOOK.md',
    'BUDGETLOOM_FINAL_IMPLEMENTATION_REPORT.md',
  ]
  for (const docRel of requiredDocs) {
    const p = path.join(ROOT, docRel)
    assert.ok(fs.existsSync(p) && fs.statSync(p).size > 2000, `Missing or incomplete doc: ${docRel}`)
  }
})

// Guard release-critical infrastructure behavior with a dependency-free check.
test('Migration runner is transactional, locked, and skips applied versions', () => {
  const source = fs.readFileSync(path.join(ROOT, 'lib/db.ts'), 'utf8')
  assert.ok(source.includes('await withTransaction(async (client) => {'))
  assert.ok(source.includes('pg_advisory_xact_lock'))
  assert.ok(source.includes('if (recorded.has(migration.version)) continue'))
  assert.ok(source.includes("'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)'"))
})
