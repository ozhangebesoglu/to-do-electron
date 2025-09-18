import * as esbuild from 'esbuild';
import { rmSync, mkdirSync } from 'fs';
import path from 'path';

const outdir = 'dist';

async function run({ watch=false }={}) {
  if (!watch) {
    try { rmSync(outdir,{recursive:true,force:true}); } catch {}
    mkdirSync(outdir,{recursive:true});
  }

  const commonOptions = {
    entryPoints: ['src/renderer/index.jsx'],
    bundle: true,
    outfile: path.join(outdir,'renderer.js'),
    platform: 'browser',
    format: 'esm',
    target: ['chrome118'],
    jsx: 'automatic',
    loader: { '.js':'jsx', '.jsx':'jsx' },
    sourcemap: true,
    minify: false,
    logLevel: 'info',
    define: {
      'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : (process.env.NODE_ENV || 'production'))
    }
  };

  if (watch) {
    const ctx = await esbuild.context(commonOptions);
    await ctx.watch();
    console.log('İzleme modu açık. Değişiklikler takip ediliyor.');
    return ctx;
  } else {
    await esbuild.build(commonOptions);
    console.log('Derleme tamamlandı.');
  }
}

const watch = process.argv.includes('--watch');
run({watch});
