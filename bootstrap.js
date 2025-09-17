// bootstrap.js
// İlk kurulum: UI bağımlılıklarını indir, Maven bağımlılıklarını indir (go-offline mümkünse)

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const ROOT = __dirname;
const UI_DIR = join(ROOT, 'ui');

function run(cmd, args, cwd, env = process.env) {
  return new Promise((resolve, reject) => {
    console.log(`> ${cmd} ${args.join(' ')}   (cwd: ${cwd})`);
    const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true, env });
    p.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${cmd} failed (${code})`)));
  });
}

(async () => {
  try {
    if (!existsSync(UI_DIR) || !existsSync(join(UI_DIR, 'package.json'))) {
      throw new Error(`UI klasörü veya package.json bulunamadı: ${UI_DIR}`);
    }

    // 1) UI bağımlılıkları
    const hasPnpm = !!process.env.npm_config_user_agent?.includes('pnpm') || existsSync(join(UI_DIR, 'pnpm-lock.yaml'));
    const hasYarn = existsSync(join(UI_DIR, 'yarn.lock'));

    if (hasPnpm) {
      await run('pnpm', ['install'], UI_DIR);
    } else if (hasYarn) {
      await run('yarn', ['install'], UI_DIR);
    } else {
      // lock varsa daha deterministik
      const useCi = existsSync(join(UI_DIR, 'package-lock.json'));
      await run('npm', [useCi ? 'ci' : 'install'], UI_DIR);
    }

    // 2) Maven bağımlılıklarını indir (mvnw varsa onu kullan)
    const mvnw = process.platform === 'win32' ? join(ROOT, 'mvnw.cmd') : join(ROOT, 'mvnw');
    if (existsSync(join(ROOT, 'pom.xml'))) {
      if (existsSync(mvnw)) {
        // go-offline bazı projelerde yoksa fallback'li çalış
        try {
          await run(mvnw, ['-q', 'dependency:go-offline', '-DskipTests'], ROOT);
        } catch {
          await run(mvnw, ['-q', '-DskipTests', 'help:evaluate', '-Dexpression=project.version', '-DforceStdout'], ROOT);
        }
      } else {
        try {
          await run('mvn', ['-q', 'dependency:go-offline', '-DskipTests'], ROOT);
        } catch {
          await run('mvn', ['-q', '-DskipTests', 'help:evaluate', '-Dexpression=project.version', '-DforceStdout'], ROOT);
        }
      }
    }

    console.log('\n✅ Bootstrap tamamlandı. Çalıştırmak için:');
    console.log('   node start-dev.js\n');
  } catch (e) {
    console.error('❌ Bootstrap hatası:', e.message || e);
    process.exit(1);
  }
})();
