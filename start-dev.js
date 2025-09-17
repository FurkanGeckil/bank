// start-dev.js
// Tek komutla: Spring Boot (8081) + Vite/React UI (5174) + tarayıcı aç


const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const http = require('http');

const ROOT = __dirname;
const UI_DIR = join(ROOT, 'ui');

// ---- Arg & Env ----
function getArg(name, fallback) {
  const found = process.argv.find(a => a.startsWith(`--${name}=`));
  if (found) {
    const v = found.split('=')[1];
    if (v) return v;
  }
  return process.env[name.toUpperCase()] || fallback;
}

const API_PORT = Number(getArg('api-port', 8081));
const UI_PORT  = Number(getArg('ui-port', 5174));

// ---- Helpers ----
function start(cmd, args, options = {}) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...options });
  return child;
}

function openBrowser(url) {
  const platform = process.platform;
  if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', shell: true });
  } else if (platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore' });
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore' });
  }
}

function waitForUrl(url, timeoutMs = 25000) {
  const startAt = Date.now();
  return new Promise(resolve => {
    (function tick() {
      const req = http.get(url, res => {
        // 2xx/3xx geldiyse hazır kabul et
        if (res.statusCode && res.statusCode < 500) {
          res.resume();
          resolve(true);
        } else {
          res.resume();
          retry();
        }
      });
      req.on('error', retry);
      req.setTimeout(2000, () => { req.destroy(new Error('timeout')); });

      function retry() {
        if (Date.now() - startAt > timeoutMs) return resolve(false);
        setTimeout(tick, 500);
      }
    })();
  });
}

function detectBackend() {
  // Öncelik: Maven wrapper → mvn → Gradle wrapper → gradle
  const isWin = process.platform === 'win32';
  const mvnw = isWin ? join(ROOT, 'mvnw.cmd') : join(ROOT, 'mvnw');
  const gradlew = isWin ? join(ROOT, 'gradlew.bat') : join(ROOT, 'gradlew');

  if (existsSync(mvnw) && existsSync(join(ROOT, 'pom.xml'))) {
    return { cmd: mvnw, args: ['-q', '-DskipTests', `spring-boot:run`, `-Dspring-boot.run.arguments=--server.port=${API_PORT}`], cwd: ROOT };
  }
  if (existsSync(join(ROOT, 'pom.xml'))) {
    return { cmd: 'mvn', args: ['-q', '-DskipTests', `spring-boot:run`, `-Dspring-boot.run.arguments=--server.port=${API_PORT}`], cwd: ROOT };
  }
  if (existsSync(gradlew) && existsSync(join(ROOT, 'build.gradle'))) {
    return { cmd: gradlew, args: ['bootRun', `--args=--server.port=${API_PORT}`, '--no-daemon'], cwd: ROOT };
  }
  if (existsSync(join(ROOT, 'build.gradle'))) {
    return { cmd: 'gradle', args: ['bootRun', `--args=--server.port=${API_PORT}`, '--no-daemon'], cwd: ROOT };
  }
  throw new Error('pom.xml veya build.gradle bulunamadı. Backend kökte değilse scripti güncelleyin.');
}

// ---- Guards ----
if (!existsSync(UI_DIR) || !existsSync(join(UI_DIR, 'package.json'))) {
  console.error(`❌ UI klasörü veya package.json bulunamadı: ${UI_DIR}`);
  process.exit(1);
}

// ---- Start ----
console.log('\n🚀 Servisler başlatılıyor (API + UI)\n');

let api, ui;

try {
  const be = detectBackend();
  console.log(`Backend: ${be.cmd} ${be.args.join(' ')}   (cwd: ${be.cwd})`);
  api = start(be.cmd, be.args, { cwd: be.cwd });

  console.log(`UI     : npm run dev                      (cwd: ${UI_DIR})`);
  // UI portu Vite'a env ile geçiyoruz; vite.config.js içinde server.port = process.env.VITE_PORT olmalı
  const uiEnv = { ...process.env, VITE_PORT: String(UI_PORT) };
  ui = start('npm', ['run', 'dev'], { cwd: UI_DIR, env: uiEnv });

  // Tarayıcıyı hazır olunca aç (fallback 1.5s sonra yine dene)
  const uiUrl = `http://localhost:${UI_PORT}`;
  waitForUrl(uiUrl, 25000).then(ok => {
    if (!ok) setTimeout(() => openBrowser(uiUrl), 1500);
    else openBrowser(uiUrl);
  });

} catch (err) {
  console.error('❌ Başlatma hatası:', err.message || err);
  process.exit(1);
}

// ---- Graceful shutdown ----
function terminate() {
  console.log('\n🛑 Kapatılıyor...');
  const isWin = process.platform === 'win32';
  if (isWin) {
    if (api?.pid) spawn('taskkill', ['/PID', String(api.pid), '/T', '/F'], { shell: true, stdio: 'ignore' });
    if (ui?.pid)  spawn('taskkill', ['/PID', String(ui.pid),  '/T', '/F'], { shell: true, stdio: 'ignore' });
  } else {
    if (api?.pid) try { process.kill(api.pid, 'SIGINT'); } catch {}
    if (ui?.pid)  try { process.kill(ui.pid,  'SIGINT'); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT',  terminate);
process.on('SIGTERM', terminate);
process.on('exit',    () => console.log('👋 Çıkış'));
