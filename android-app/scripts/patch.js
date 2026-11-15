// Подготвя генерирания Android проект: права, подпис, версия, малка иконка за известия.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const app = path.join(root, 'android', 'app');
const must = (cond, msg) => { if (!cond) { console.error('ГРЕШКА: ' + msg); process.exit(1); } };

// 1) версия от index.html
const html = fs.readFileSync(path.join(root, '..', 'index.html'), 'utf8');
const m = html.match(/APP_VERSION\s*=\s*'([\d.]+)'/);
must(m, 'не намирам APP_VERSION в index.html');
const versionName = m[1];
const versionCode = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10) + 100;

// 2) build.gradle: версия + подпис
const gp = path.join(app, 'build.gradle');
let g = fs.readFileSync(gp, 'utf8');
must(/versionCode\s+\d+/.test(g) && /versionName\s+"[^"]*"/.test(g), 'build.gradle: няма versionCode/versionName');
g = g.replace(/versionCode\s+\d+/, 'versionCode ' + versionCode).replace(/versionName\s+"[^"]*"/, 'versionName "' + versionName + '"');
must(/buildTypes\s*\{/.test(g) && /minifyEnabled\s+false/.test(g), 'build.gradle: непознат формат на buildTypes');
const signing = `signingConfigs {
        release {
            storeFile file("../../samun.keystore")
            storePassword "samun-keystore-2026"
            keyAlias "samun"
            keyPassword "samun-keystore-2026"
        }
    }
    buildTypes {`;
g = g.replace(/buildTypes\s*\{/, signing).replace(/minifyEnabled\s+false/, 'minifyEnabled false\n            signingConfig signingConfigs.release');
fs.writeFileSync(gp, g);

// 3) AndroidManifest: права
const mp = path.join(app, 'src', 'main', 'AndroidManifest.xml');
let x = fs.readFileSync(mp, 'utf8');
must(x.includes('</manifest>'), 'AndroidManifest.xml: няма </manifest>');
const perms = [
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  '<uses-permission android:name="android.permission.USE_EXACT_ALARM" />',
  '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
  '<uses-permission android:name="android.permission.VIBRATE" />',
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-feature android:name="android.hardware.camera" android:required="false" />'
].filter(p => !x.includes(p.match(/android:name="([^"]+)"/)[1]));
x = x.replace('</manifest>', '    ' + perms.join('\n    ') + '\n</manifest>');
fs.writeFileSync(mp, x);

// 4) малка иконка за известията (бял силует на самун)
const dr = path.join(app, 'src', 'main', 'res', 'drawable');
fs.mkdirSync(dr, { recursive: true });
fs.writeFileSync(path.join(dr, 'ic_stat_samun.xml'), `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
  <path android:fillColor="#FFFFFFFF" android:pathData="M2.5,15.5c0,-5 4.4,-9 9.5,-9s9.5,4 9.5,9c0,1.1 -0.9,2 -2,2h-15c-1.1,0 -2,-0.9 -2,-2z"/>
</vector>
`);
console.log('Подготвено: версия ' + versionName + ' (код ' + versionCode + ')');
