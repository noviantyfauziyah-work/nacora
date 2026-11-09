import { testSuite } from '../tests/recommend.test.mjs';

async function run() {
  console.log('====================================================');
  console.log(' NACORA Automated Test Runner (npm test)');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  for (const t of testSuite) {
    try {
      await t.fn();
      console.log(`  [LULUS] ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`  [GAGAL] ${t.name}`);
      console.error(`          ${err.message}`);
      failed++;
    }
  }

  console.log('----------------------------------------------------');
  console.log(`Ringkasan Uji: ${passed} lulus, ${failed} gagal (Total: ${testSuite.length} kasus uji)`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run();

