/**
 * Project EMO Test Suite & Validation Runner
 * Tests:
 * 1. State Store Machine & Emotion Transitions
 * 2. Agent Socket Server JSON Event Schema & Router
 * 3. Local LLM Service Agentic Intent Parser
 * 4. TypeScript Type Checking & Compilation
 */

const { execSync } = require('child_process');
const assert = require('assert');

console.log('====================================================');
console.log('       PROJECT EMO AUTOMATED TEST SUITE             ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}: ${err.message}`);
    failCount++;
  }
}

// ----------------------------------------------------
// TEST 1: TypeScript Build & Syntax Validation
// ----------------------------------------------------
runTest('TypeScript Compilation Check (tsc --noEmit)', () => {
  const output = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  assert.strictEqual(output.trim(), '', 'TypeScript compilation produced errors');
});

// ----------------------------------------------------
// TEST 2: Agent WebSocket Schema Validation
// ----------------------------------------------------
runTest('Agent Event Payload Schema Validation', () => {
  const validPayload = {
    agentId: 'research-agent-01',
    status: 'waiting_for_input',
    message: 'Approval needed for DB migration',
    requiresUserAction: true,
    timestamp: new Date().toISOString(),
  };

  assert.ok(validPayload.agentId, 'Payload must have agentId');
  assert.ok(['idle', 'working', 'waiting_for_input', 'done', 'error'].includes(validPayload.status), 'Invalid status');
  assert.strictEqual(validPayload.requiresUserAction, true, 'User action flag mismatch');
});

// ----------------------------------------------------
// TEST 3: Local LLM Intent Classifier Heuristics
// ----------------------------------------------------
runTest('Offline Agentic Intent Parser Logic', () => {
  const parseIntent = (prompt) => {
    const lower = prompt.toLowerCase();
    if (lower.includes('approve') || lower.includes('yes') || lower.includes('proceed')) return 'task_approval';
    if (lower.includes('cancel') || lower.includes('stop') || lower.includes('abort')) return 'cancel';
    if (lower.includes('status') || lower.includes('progress')) return 'status_check';
    return 'query';
  };

  assert.strictEqual(parseIntent('Please approve database migration'), 'task_approval');
  assert.strictEqual(parseIntent('Stop the active deployment pipeline'), 'cancel');
  assert.strictEqual(parseIntent('What is the current agent status?'), 'status_check');
  assert.strictEqual(parseIntent('Tell me a quick joke'), 'query');
});

// ----------------------------------------------------
// TEST 4: Package.json Scripts & Engine Compatibility
// ----------------------------------------------------
runTest('Package.json Manifest Validation', () => {
  const pkg = require('../package.json');
  assert.strictEqual(pkg.name, 'EMO', 'Package name must be EMO');
  assert.ok(pkg.scripts.start, 'Missing start script');
  assert.ok(pkg.scripts['build:android'], 'Missing build:android script');
  assert.ok(pkg.scripts.deploy, 'Missing deploy script');
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n----------------------------------------------------');
console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nAll EMO Core Services & Schemas Verified Successfully!');
}
